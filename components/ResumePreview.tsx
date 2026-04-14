import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
  font?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, scale = 1, font = 'Times New Roman, serif' }) => {
  return (
    <div 
      id="resume-preview"
      className="bg-white text-black p-[0.5in] mx-auto origin-top flex flex-col shadow-2xl"
      style={{ 
        width: '8.5in', 
        minHeight: '11in',
        transform: `scale(${scale})`,
        marginBottom: `${(scale - 1) * -11}in`,
        fontFamily: font,
        lineHeight: 1.3,
        fontSize: '11pt',
        color: '#000'
      }}
    >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-[24pt] font-bold mb-1.5 uppercase tracking-wide text-black leading-none">{data.fullName}</h1>
          <div className="text-[10pt] text-black flex justify-center flex-wrap gap-x-1.5 leading-snug">
             <span>{data.contactInfo}</span>
          </div>
        </div>

        {/* Professional Summary */}
        {data.summary && (
          <div className="mb-5 break-inside-avoid">
            <h2 className="text-[11pt] font-bold uppercase border-b border-black mb-2 tracking-wide">Professional Summary</h2>
            <p className="text-[10.5pt] text-justify leading-snug">
              {data.summary}
            </p>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[11pt] font-bold uppercase border-b border-black mb-3 tracking-wide">Education</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-3 break-inside-avoid">
                <div className="flex justify-between items-baseline text-[11pt]">
                  <span className="font-bold">{edu.school}</span>
                  <span className="font-bold">{edu.location}</span>
                </div>
                <div className="flex justify-between items-baseline text-[10.5pt] mb-1">
                  <span className="italic">{edu.degree}</span>
                  <span>{edu.year}</span>
                </div>
                {edu.details.length > 0 && (
                  <ul className="list-disc ml-5 text-[10.5pt] marker:text-black mt-1">
                    {edu.details.map((detail, idx) => (
                      <li key={idx} className="pl-0.5 mb-0.5">{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Professional Experience */}
        {data.experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[11pt] font-bold uppercase border-b border-black mb-3 tracking-wide">Professional Experience</h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-4 break-inside-avoid">
                <div className="flex justify-between items-baseline text-[11pt]">
                  <span className="font-bold">{exp.company}</span>
                  <span className="font-bold">{exp.location}</span>
                </div>
                <div className="flex justify-between items-baseline text-[10.5pt] mb-1">
                  <span className="italic">{exp.role}</span>
                  <span>{exp.duration}</span>
                </div>
                <ul className="list-disc ml-5 text-[10.5pt] marker:text-black mt-1">
                  {exp.points.map((point, idx) => (
                    <li key={idx} className="pl-0.5 mb-0.5 text-justify">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Technical Skills */}
        {data.skills.length > 0 && (
          <div className="mb-5 break-inside-avoid">
            <h2 className="text-[11pt] font-bold uppercase border-b border-black mb-2 tracking-wide">Technical Skills</h2>
            <div className="text-[10.5pt]">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="mb-1">
                  <span className="font-bold">{'• ' + skill.category}:</span> {skill.items}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info / Achievements */}
        {data.additionalInfo.points.length > 0 && (
           <div className="mb-5 break-inside-avoid">
              <h2 className="text-[11pt] font-bold uppercase border-b border-black mb-2 tracking-wide">{data.additionalInfo.title}</h2>
              <ul className="list-disc ml-5 text-[10.5pt] marker:text-black">
                  {data.additionalInfo.points.map((point, idx) => (
                      <li key={idx} className="pl-0.5 mb-0.5 text-justify">{point}</li>
                  ))}
              </ul>
          </div>
        )}
    </div>
  );
};

export default ResumePreview;