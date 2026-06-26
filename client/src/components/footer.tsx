import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const footerSections = [
        {
            title: 'FOR BUYERS',
            links: [
                { label: 'Browse Products', href: '#' },
                { label: 'Categories', href: '#' },
                { label: 'Track Orders', href: '#' },
                { label: 'Wishlist', href: '#' }
            ]
        },
        {
            title: 'FOR SELLERS',
            links: [
                { label: 'Seller Dashboard', href: '#' },
                { label: 'List Products', href: '#' },
                { label: 'Manage Orders', href: '#' },
                { label: 'Sales Reports', href: '#' }
            ]
        },
        {
            title: 'SUPPORT',
            links: [
                { label: 'About Us', href: '#' },
                { label: 'Contact Us', href: '#' },
                { label: 'Help Center', href: '#' },
                { label: 'Shipping Info', href: '#' }
            ]
        },
        {
            title: 'LEGAL',
            links: [
                { label: 'Terms of Service', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Cookie Policy', href: '#' },
                { label: 'Return Policy', href: '#' }
            ]
        }
    ];

    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="max-w-full mx-auto px-6 py-8 text-primary-foreground">
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center font-semibold text-sm">
                                AM
                            </div>
                            <div>
                                <h3 className="font-bold">AgroMarket</h3>
                            </div>
                        </div>
                        <p className="text-xs mt-2">
                            Connecting farmers with fresh product lovers since 1999
                        </p>
                    </div>

                    {/* Footer Links */}
                    {footerSections.map((section, idx) => (
                        <div key={idx}>
                            <h4 className="text-xs font-semibold uppercase mb-3 tracking-wide">
                                {section.title}
                            </h4>
                            <ul className="space-y-2">
                                {section.links.map((link, linkIdx) => (
                                    <li key={linkIdx}>
                                        <a
                                            href={link.href}
                                            className="text-sm hover:text-gray-900 transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-300 pt-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Social Icons */}
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-blue-400 hover:text-blue-500 transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-pink-600 hover:text-pink-700 transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-blue-700 hover:text-blue-800 transition-colors">
                                <Linkedin size={20} />
                            </a>
                        </div>

                        {/* Copyright and Contact */}
                        <div className="text-center md:text-right">
                            <p className="text-xs">
                                © {currentYear} AgroMarket. All rights reserved | Fresh. Local. Sustainable.
                            </p>
                            <p className="text-xs mt-1">
                                Customer Support: 1-800-AGRO-MKT | Email: support@agromarket.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;