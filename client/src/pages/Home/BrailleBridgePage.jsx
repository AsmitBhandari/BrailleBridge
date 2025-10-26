import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Section from "../../components/Home/Section";
import TeamMemberCard from "../../components/Home/DeveloperCard";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, History } from "lucide-react";

const BrailleBridgePage = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            BrailleBridge
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                            AI-powered Braille Translation for Educational Materials
                        </p>
                        <p className="text-lg mb-12 max-w-4xl mx-auto">
                            Break down educational barriers for visually impaired individuals with our innovative 
                            solution that converts printed and digital content into Braille and audio formats.
                        </p>
                        
                        {isAuthenticated ? (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/home/dashboard">
                                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                        Go to Dashboard
                                    </Button>
                                </Link>
                                
                                {/* Quick Navigation Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                    <Link to="/home/dashboard#translate-section">
                                        <Button 
                                            size="lg" 
                                            className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-blue-600 flex items-center space-x-2 shadow-lg font-medium"
                                        >
                                            <FileText className="h-5 w-5" />
                                            <span>Translate</span>
                                        </Button>
                                    </Link>
                                    
                                    <Link to="/home/dashboard#recent-documents">
                                        <Button 
                                            size="lg" 
                                            className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-blue-600 flex items-center space-x-2 shadow-lg font-medium"
                                        >
                                            <History className="h-5 w-5" />
                                            <span>Recent</span>
                                        </Button>
                                    </Link>
                                    
                                    <Link to="/home/history">
                                        <Button 
                                            size="lg" 
                                            className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-blue-600 flex items-center space-x-2 shadow-lg font-medium"
                                        >
                                            <History className="h-5 w-5" />
                                            <span>History</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/auth/signup">
                                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link to="/auth/login">
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Everything you need to make educational content accessible
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    📄 Document Processing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Upload PDFs, images, and documents for instant text extraction and Braille conversion
                                </CardDescription>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    🔊 Audio Generation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Convert text to high-quality audio in multiple languages for easy listening
                                </CardDescription>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    🌍 Multi-Language Support
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Support for 12+ Indian languages including Hindi, Tamil, Telugu, and more
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Section title="About BrailleBridge">
                        <div className="prose prose-lg max-w-none">
                            <p className="text-gray-700 leading-relaxed">
                                BrailleBridge is an innovative AI-powered solution aimed at breaking educational barriers
                    for visually impaired individuals. It automatically converts printed or digital
                    content—such as textbooks, PDFs, and handwritten notes—into Braille and audio
                                formats, making study materials more accessible and inclusive.
                            </p>
                            
                            <p className="text-gray-700 leading-relaxed mt-6">
                                Using advanced technologies like Optical Character Recognition (OCR), Natural Language
                    Processing (NLP), and text-to-speech systems, BrailleBridge extracts and
                    simplifies text before translating it into readable Braille (.brf) files or
                    spoken audio. The platform supports multiple Indian languages and works
                                seamlessly across web and desktop interfaces.
                            </p>
                            
                            <p className="text-gray-700 leading-relaxed mt-6">
                                This project empowers visually impaired learners to study independently without 
                                depending on costly Braille devices or external help. By providing a low-cost, 
                                scalable, and user-friendly solution, BrailleBridge promotes inclusivity in 
                                education and supports the vision of equal educational opportunities for all.
                            </p>
                        </div>
                </Section>
                </div>
            </div>

            {/* Team Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Team
                        </h2>
                        <p className="text-xl text-gray-600">
                            Dedicated developers working to make education accessible
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-6">
                    <TeamMemberCard />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrailleBridgePage;
