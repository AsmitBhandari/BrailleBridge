import React from "react";
import Section from "../../components/Home/Section";
import TeamMemberCard from "@/components/Home/DeveloperCard";

const BrailleBridgePage = () => {
    return (
        <div>
            <div className="max-w-4xl mx-auto p-3">
                <Section title="Braille-Bridge">
                    {/* glt likha h sudhrna h */}
                    This is an innovative AI-powered solution aimed at breaking educational barriers
                    for visually impaired individuals. It automatically converts printed or digital
                    content—such as textbooks, PDFs, and handwritten notes—into Braille and audio
                    formats, making study materials more accessible and inclusive. Using advanced
                    technologies like Optical Character Recognition (OCR), Natural Language
                    Processing (NLP), and text-to-speech systems, BrailleBridge extracts and
                    simplifies text before translating it into readable Braille (.brf) files or
                    spoken audio. The platform supports multiple Indian languages and works
                    seamlessly across web and desktop interfaces, ensuring ease of access for
                    students, teachers, and institutions.
                    BrailleBridge bridges the gap between traditional content and accessible
                    education using low-cost, scalable software. It enables visually impaired
                    students to access digital and printed study materials easily, fostering
                    inclusivity and empowering independence.
                    This project holds great importance as it empowers visually impaired learners to study independently without depending on costly Braille devices or external help. By providing a low-cost, scalable, and user-friendly solution, BrailleBridge promotes inclusivity in education, enhances digital literacy among the blind community, and helps bridge the gap between traditional content and accessible learning. Ultimately, it supports the vision of equal educational opportunities for all, fostering self-confidence, independence, and a more inclusive society.
                </Section>
            </div>
            <div className="flex flex-wrap justify-center gap-6 py-10">
                    <TeamMemberCard />
            </div>
        </div>
    );
};

export default BrailleBridgePage;
