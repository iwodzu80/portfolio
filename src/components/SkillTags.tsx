
import React from "react";

interface SkillTagsProps {
  skills: string[];
}

const SkillTags: React.FC<SkillTagsProps> = ({ skills }) => {
  return (
    <div className="flex flex-wrap">
      {skills.map((skill, index) => (
        <span
          key={index}
          className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
        >
          {skill}
        </span>
      ))}
    </div>
  );
};

export default SkillTags;
