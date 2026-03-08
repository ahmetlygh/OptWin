"use client";

import React from "react";

export function USFlag({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" className={className}>
            <rect width="7410" height="3900" fill="#3c3b6e" />
            <path d="M0 450H7410M0 1050H7410M0 1650H7410M0 2250H7410M0 2850H7410M0 3450H7410" stroke="#fff" strokeWidth="300" />
            <path d="M0 150H7410M0 750H7410M0 1350H7410M0 1950H7410M0 2550H7410M0 3150H7410M0 3750H7410" stroke="#b22234" strokeWidth="300" />
            <rect width="2964" height="2100" fill="#3c3b6e" />
            <g fill="#fff">
                <g id="s18">
                    <g id="s9">
                        <g id="s5">
                            <g id="s4">
                                <path id="s" d="M247 90l70.534 217.082-184.66-134.164h228.252L176.466 307.082z" />
                                <use xlinkHref="#s" x="494" />
                                <use xlinkHref="#s" x="988" />
                                <use xlinkHref="#s" x="1482" />
                            </g>
                            <use xlinkHref="#s" x="1976" />
                        </g>
                        <use xlinkHref="#s4" x="247" y="150" />
                    </g>
                    <use xlinkHref="#s9" y="300" />
                </g>
                <use xlinkHref="#s18" y="600" />
                <use xlinkHref="#s9" y="1200" />
                <use xlinkHref="#s5" y="1500" x="247" />
            </g>
        </svg>
    );
}

export function TRFlag({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className={className}>
            <rect width="1200" height="800" fill="#e30a17" />
            <circle cx="425" cy="400" r="200" fill="#fff" />
            <circle cx="475" cy="400" r="160" fill="#e30a17" />
            <path d="M583.334 400l180.901 58.779-69.098-212.664v212.664l-69.098-212.664z" fill="#fff" transform="translate(100 0) rotate(-18 673.835 400)" />
        </svg>
    );
}

export function CNFlag({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" className={className}>
            <rect width="30" height="20" fill="#ee1c25" />
            <g fill="#ffff00">
                <path transform="translate(5,5) scale(3)" d="M0,-1 0.587785,0.809017 -0.951057,-0.309017 0.951057,-0.309017 -0.587785,0.809017z" />
                <path transform="translate(10,2) rotate(-120.96) scale(1)" d="M0,-1 0.587785,0.809017 -0.951057,-0.309017 0.951057,-0.309017 -0.587785,0.809017z" />
                <path transform="translate(12,4) rotate(-98.13) scale(1)" d="M0,-1 0.587785,0.809017 -0.951057,-0.309017 0.951057,-0.309017 -0.587785,0.809017z" />
                <path transform="translate(12,7) rotate(-74.05) scale(1)" d="M0,-1 0.587785,0.809017 -0.951057,-0.309017 0.951057,-0.309017 -0.587785,0.809017z" />
                <path transform="translate(10,9) rotate(-51.34) scale(1)" d="M0,-1 0.587785,0.809017 -0.951057,-0.309017 0.951057,-0.309017 -0.587785,0.809017z" />
            </g>
        </svg>
    );
}

export function ESFlag({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" className={className}>
            <rect width="750" height="500" fill="#fabd00" />
            <rect width="750" height="125" fill="#ad1519" />
            <rect width="750" height="125" y="375" fill="#ad1519" />
            {/* Simplified coat of arms or placeholder circle to keep it small and clean */}
            <circle cx="150" cy="250" r="40" fill="#ad1519" opacity="0.8" />
        </svg>
    );
}

export function INFlag({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={className}>
            <rect width="900" height="600" fill="#fff" />
            <rect width="900" height="200" fill="#f4c430" />
            <rect width="900" height="200" y="400" fill="#228b22" />
            <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="4" />
            <circle cx="450" cy="300" r="10" fill="#000080" />
            <g transform="translate(450,300)" fill="#000080">
                {[...Array(24)].map((_, i) => (
                    <rect key={i} width="2" height="80" transform={`rotate(${i * 15})`} x="-1" y="-80" opacity="0.5" />
                ))}
            </g>
        </svg>
    );
}

export function DEFlag({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className={className}>
            <rect width="5" height="1" fill="#000" />
            <rect width="5" height="1" y="1" fill="#DD0000" />
            <rect width="5" height="1" y="2" fill="#FFCC00" />
        </svg>
    );
}

export function FRFlag({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className}>
            <rect width="1" height="2" fill="#002395" />
            <rect width="1" height="2" x="1" fill="#fff" />
            <rect width="1" height="2" x="2" fill="#ED2939" />
        </svg>
    );
}
