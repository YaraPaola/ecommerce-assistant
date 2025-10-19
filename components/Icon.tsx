import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: string;
}

const iconPaths: { [key: string]: string } = {
    'upload-cloud': 'M7 16a4 4 0 01-4-4V7a4 4 0 014-4h4a4 4 0 014 4v5m-4 4h-4m4-4l-4 4m4-4l4-4',
    download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    x: 'M6 18L18 6M6 6l12 12',
    check: 'M5 13l4 4L19 7',
    film: 'M7 4v16M17 4v16M3 8h4m0 8H3m18-8h-4m0 8h4M3 12h18',
    'musical-note': 'M9 19V6l12-3v13M9 19c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm12-11c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    upload: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
    'chevron-up': 'M5 15l7-7 7 7',
    'chevron-down': 'M19 9l-7 7-7-7',
    'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'x-circle': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    'info-circle': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'rotate-left': 'M7 21a9 9 0 01-4.95-16.95M3 8V4h4',
    'rotate-right': 'M17 21a9 9 0 004.95-16.95M21 8v4h-4',
    refresh: 'M4 4v5h5M20 20v-5h-5M4 4a15.937 15.937 0 0113.43-6.56M20 20c-3.11 3.11-7.14 4.88-11.31 4.88',
    sparkles: 'M5 3v4M3 5h4M5 17v4m-2-2h4M11 3v4M9 5h4M11 17v4m-2-2h4M19 3v4M17 5h4M19 17v4m-2-2h4',
    play: 'M5 3l14 9-14 9V3z',
    pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
    'linear-focus': 'M4 7h16M4 17h16'
};

const iconProps: { [key: string]: React.SVGProps<SVGSVGElement> } = {
    play: {
        fill: 'currentColor',
        strokeWidth: 0,
    },
    pause: {
        fill: 'currentColor',
        strokeWidth: 0,
    }
}

export const Icon: React.FC<IconProps> = ({ name, className = 'w-5 h-5', ...props }) => {
    if (name === 'spinner') {
        return (
            <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        );
    }
    
    const path = iconPaths[name];
    const specificProps = iconProps[name] || {};

    if (!path) {
        console.warn(`Icon "${name}" not found.`);
        return <svg className={className} {...props} />;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...specificProps}
            {...props}
        >
            <path d={path}></path>
        </svg>
    );
};