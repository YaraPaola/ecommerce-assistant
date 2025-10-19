import { ProductData, SEOContent, Variant, ImageFile, VideoFile } from "../types";

const CREATE_STAGED_UPLOADS_MUTATION = `
mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters {
        name
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

const PRODUCT_CREATE_MUTATION = `
mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
  productCreate(input: $input, media: $media) {
    product {
      id
      handle
      onlineStoreUrl
    }
    userErrors {
      field
      message
    }
  }
}
`;

interface ShopifyPublishArgs {
    productData: ProductData;
    seoContent: SEOContent;
    selectedVariants: Variant[];
    selectedImages: ImageFile[];
    selectedVideos: VideoFile[];
    showToast: (type: 'info' | 'error', message: string) => void;
}

const dataURItoBlob = (dataURI: string, mimeType: string): Blob => {
    const byteString = atob(dataURI);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
}

async function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}, timeout = 30000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('Request timed out.');
        }
        throw error;
    }
}

async function graphqlRequest(store: string, token: string, query: string, variables: object) {
    const response = await fetchWithTimeout(`/api/shopify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ store, token, query, variables }),
    }, 60000); // 60 second timeout for API calls

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Proxy request failed: ${response.status} ${response.statusText}. Response: ${errorBody}`);
    }

    const json = await response.json();
    if (json.errors || (json.data && (json.data.stagedUploadsCreate?.userErrors?.length || json.data.productCreate?.userErrors?.length))) {
        const errorMessages = (json.errors?.map((e: any) => e.message) ?? []).concat(
            (json.data?.stagedUploadsCreate?.userErrors?.map((e: any) => `Staged Upload Error: ${e.message}`) ?? []),
            (json.data?.productCreate?.userErrors?.map((e: any) => `Product Creation Error: ${e.message}`) ?? [])
        );
        throw new Error(errorMessages.join(', '));
    }
    return json.data;
}


export const publishToShopify = async ({
    productData, seoContent, selectedVariants, selectedImages, selectedVideos, showToast
}: ShopifyPublishArgs) => {

    const { shopifyStore, shopifyToken } = productData;
    if (!shopifyStore || !shopifyToken) {
        throw new Error('Shopify store and token are required.');
    }

    const sanitizedStore = shopifyStore
        .replace(/https?:\/\//, '')
        .replace(/\.myshopify\.com.*/, '')
        .trim();
    
    const sanitizedToken = shopifyToken.trim();


    if (!sanitizedStore || !sanitizedToken) {
        throw new Error('Invalid Shopify store name or token provided.');
    }

    const mediaResourceUrls: { url: string, type: 'IMAGE' | 'VIDEO' }[] = [];

    // Process Images
    if (selectedImages.length > 0) {
        showToast('info', 'Preparing image uploads...');
        const stagedUploadsInput = selectedImages.map(image => ({
            resource: 'PRODUCT_IMAGE',
            filename: image.name,
            mimeType: image.mimeType,
            httpMethod: 'POST',
        }));

        const stagedUploadsResponse = await graphqlRequest(sanitizedStore, sanitizedToken, CREATE_STAGED_UPLOADS_MUTATION, { input: stagedUploadsInput });
        const stagedTargets = stagedUploadsResponse?.stagedUploadsCreate?.stagedTargets;
        if (!stagedTargets || stagedTargets.length === 0) {
            throw new Error('Failed to create staged upload targets for images.');
        }

        await Promise.all(stagedTargets.map(async (target: any, index: number) => {
            showToast('info', `Uploading image ${index + 1} of ${stagedTargets.length}...`);
            const image = selectedImages[index];
            const formData = new FormData();
            target.parameters.forEach(({ name, value }: { name: string, value: string }) => {
                formData.append(name, value);
            });
            const blob = dataURItoBlob(image.base64, image.mimeType);
            formData.append('file', blob, image.name);
            
            const uploadResponse = await fetchWithTimeout(target.url, { method: 'POST', body: formData }, 45000);
            if (!uploadResponse.ok) throw new Error(`Failed to upload image ${image.name}.`);
            mediaResourceUrls.push({ url: target.resourceUrl, type: 'IMAGE' });
        }));
    }
    
    // Process Videos
    if (selectedVideos.length > 0) {
        showToast('info', 'Preparing video uploads...');
        const stagedUploadsInput = selectedVideos.map(video => ({
            resource: 'VIDEO',
            filename: video.name,
            mimeType: 'video/mp4',
            httpMethod: 'POST',
        }));

        const stagedUploadsResponse = await graphqlRequest(sanitizedStore, sanitizedToken, CREATE_STAGED_UPLOADS_MUTATION, { input: stagedUploadsInput });
        const stagedTargets = stagedUploadsResponse?.stagedUploadsCreate?.stagedTargets;
        if (!stagedTargets || stagedTargets.length === 0) throw new Error('Failed to create staged upload targets for videos.');

        await Promise.all(stagedTargets.map(async (target: any, index: number) => {
            showToast('info', `Uploading video ${index + 1} of ${stagedTargets.length}...`);
            const video = selectedVideos[index];
            
            // Fetch video from URL
            const videoResponse = await fetchWithTimeout(`${video.url}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) throw new Error(`Failed to download video ${video.name} for upload.`);
            const blob = await videoResponse.blob();

            const formData = new FormData();
            target.parameters.forEach(({ name, value }: { name: string, value: string }) => formData.append(name, value));
            formData.append('file', blob, video.name);
            
            const uploadResponse = await fetchWithTimeout(target.url, { method: 'POST', body: formData }, 120000); // 2 min timeout for video
            if (!uploadResponse.ok) throw new Error(`Failed to upload video ${video.name}.`);
            mediaResourceUrls.push({ url: target.resourceUrl, type: 'VIDEO' });
        }));
    }
    
    const newProduct = await createShopifyProduct(sanitizedStore, sanitizedToken, productData, seoContent, selectedVariants, mediaResourceUrls, showToast);

    if (!newProduct || !newProduct.id) {
        console.error("Product creation failed or returned an unexpected payload:", newProduct);
        throw new Error("Failed to create product. Shopify's API did not return a valid product ID.");
    }

    const productAdminUrl = `https://admin.shopify.com/store/${sanitizedStore}/products/${newProduct.id.split('/').pop()}`;

    return { productAdminUrl };
};

const getHandle = (seoContent: SEOContent) => {
     const modifiedTitle = `${seoContent.title} | 3D Printed In Multiple Color Options`;
     return modifiedTitle.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 70);
}

const createShopifyProduct = async (
    store: string,
    token: string,
    productData: ProductData,
    seoContent: SEOContent,
    selectedVariants: Variant[],
    mediaResourceUrls: { url: string, type: 'IMAGE' | 'VIDEO' }[],
    showToast: (type: 'info' | 'error', message: string) => void
) => {
    showToast('info', 'Creating product in Shopify...');
    const modifiedTitle = `${seoContent.title} | 3D Printed In Multiple Color Options`;
    const disclaimer = '<p>🌱 Each piece is uniquely crafted from eco-friendly materials using precision 3D printing. This process may result in slight textural variations, adding to the individual charm of every item.</p><p>💡 Please note: Accessories shown are for display purposes only and are not included.</p>';
    const modifiedDescription = `${seoContent.description}${disclaimer}`;
    
    const productInput = {
        title: modifiedTitle,
        descriptionHtml: modifiedDescription,
        tags: seoContent.tags,
        handle: getHandle(seoContent),
        options: ["Finish", "Color"],
        variants: selectedVariants.map(v => ({
            price: v.price.toFixed(2),
            compareAtPrice: productData.compareAtPrice ? productData.compareAtPrice.toFixed(2) : null,
            options: [v.finish, v.color],
            inventoryPolicy: 'DENY',
            requiresShipping: true,
            taxable: true,
        })),
        status: "DRAFT",
    };

    const mediaInput = mediaResourceUrls.map(media => ({
        mediaContentType: media.type,
        originalSource: media.url,
    }));

    try {
        const response = await graphqlRequest(store, token, PRODUCT_CREATE_MUTATION, { input: productInput, media: mediaInput });
        return response?.productCreate?.product;
    } catch (error) {
        // The error toast is removed from this lower-level function.
        // The top-level `handlePublish` function is now responsible for showing the final error to the user,
        // preventing duplicate or confusing notifications.
        throw error;
    }
};
