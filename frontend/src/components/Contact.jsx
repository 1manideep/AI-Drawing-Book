import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Globe, ExternalLink } from 'lucide-react';

const Contact = () => {
    return (
        <div
            className="min-h-screen w-full font-sans text-gray-900 pt-32 pb-20 px-6"
            style={{
                background: `
                    radial-gradient(circle at 70% -5%, rgba(160, 180, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%),
                    radial-gradient(circle at 40% 10%, rgba(255, 140, 230, 0.9) 0%, rgba(255, 255, 255, 0) 55%),
                    #ffffff
                `
            }}
        >
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/80 backdrop-blur-md rounded-[2rem] px-8 py-10 md:px-20 md:py-16 shadow-sm border border-white/60"
                >
                    <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-10 text-center text-gray-900">
                        Get in Touch
                    </h1>

                    <div className="space-y-12 text-lg text-gray-700 leading-relaxed font-light">
                        {/* Feedback & Support */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                Feedback & Support
                            </h2>
                            <p>
                                I’d love to hear from you! Whether you have a question, found a bug, or just want to share a masterpiece created with the <a href="https://aidrawingbook.manideep.info" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 hover:decoration-indigo-600 transition-colors">AI Drawing Book</a>, feel free to reach out.
                            </p>
                        </section>

                        {/* Share the Magic */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Share the Magic
                            </h2>
                            <p>
                                Did your kids create something amazing? I’d love to see it! Tag me or send over a photo of the finished coloring page. It’s the best part of building this project.
                            </p>
                        </section>

                        {/* Let's Connect */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Let's Connect
                            </h2>
                            <p className="mb-6">
                                If you’re interested in the tech behind this project or want to chat about AI engineering, you can find more of my work or get in touch through the following:
                            </p>

                            <div className="flex flex-col gap-6">
                                <a
                                    href="mailto:maaaanideep@gmail.com"
                                    className="flex items-center gap-3 group w-fit"
                                >
                                    <div className="text-indigo-600 group-hover:scale-110 transition-transform">
                                        <Mail size={22} />
                                    </div>
                                    <span className="font-medium text-lg text-gray-700 group-hover:text-indigo-600 transition-colors">maaaanideep@gmail.com</span>
                                </a>

                                <a
                                    href="https://www.linkedin.com/in/manideeppendyala/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 group w-fit"
                                >
                                    <div className="text-blue-600 group-hover:scale-110 transition-transform">
                                        <Linkedin size={22} />
                                    </div>
                                    <span className="font-medium text-lg text-gray-700 group-hover:text-blue-700 transition-colors">LinkedIn Profile</span>
                                    <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
                                </a>

                                <a
                                    href="https://manideep.info"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 group w-fit"
                                >
                                    <div className="text-emerald-600 group-hover:scale-110 transition-transform">
                                        <Globe size={22} />
                                    </div>
                                    <span className="font-medium text-lg text-gray-700 group-hover:text-emerald-700 transition-colors">manideep.info</span>
                                    <ExternalLink size={16} className="text-gray-400 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
                                </a>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
