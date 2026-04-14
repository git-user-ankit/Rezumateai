export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export interface StoredResume {
  id: string;
  title: string;
  lastEdited: string;
  score: number;
  data: ResumeData;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  year: string;
  details: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  duration: string;
  points: string[];
}

export interface SkillCategory {
  category: string;
  items: string;
}

export interface AdditionalInfo {
  title: string;
  points: string[];
}

export interface ResumeData {
  fullName: string;
  contactInfo: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: SkillCategory[];
  additionalInfo: AdditionalInfo;
}

export interface ATSAnalysis {
  score: number;
  feedback: string[];
  missingKeywords: {
    keyword: string;
    suggestion: string;
  }[];
}

export const initialResumeData: ResumeData = {
  fullName: "Michael Chen",
  contactInfo: "San Francisco, CA | (555) 123-4567 | michael.chen@email.com | linkedin.com/in/michaelchen | github.com/michaelchen",
  summary: "Results-driven Software Engineer with 5+ years of experience developing scalable web applications and microservices architectures. Proven track record of optimizing system performance, mentoring junior developers, and delivering high-quality solutions for 100,000+ daily active users. Passionate about continuous learning, innovation, and leveraging technology to empower organizations and drive meaningful impact.",
  education: [
    {
      id: "1",
      school: "University of California, Berkeley",
      degree: "Bachelor of Science in Computer Science",
      location: "Berkeley, CA",
      year: "2015 - 2019",
      details: [
        "Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering",
        "Strong foundation in computer science fundamentals and software development principles"
      ]
    }
  ],
  experience: [
    {
      id: "1",
      company: "TechCorp Solutions",
      role: "Backend Software Engineer",
      location: "San Francisco, CA",
      duration: "2022 - Present",
      points: [
        "Develop and maintain RESTful APIs serving 100,000+ daily active users with 99.9% uptime",
        "Optimized database queries resulting in 40% reduction in response times, enhancing user experience and reducing server costs",
        "Implemented microservices architecture using Docker and Kubernetes, improving system scalability and maintainability",
        "Collaborate with frontend teams to establish API specifications and data models, ensuring seamless integration",
        "Mentor 2 junior developers on backend development best practices and code review processes",
        "Participate in agile development processes, sprint planning, and cross-functional team collaboration",
        "Contribute to architectural decisions and technical strategy for large-scale distributed systems"
      ]
    },
    {
      id: "2",
      company: "DataFlow Systems",
      role: "Software Engineer",
      location: "San Francisco, CA",
      duration: "2021 - 2022",
      points: [
        "Built robust data processing pipelines handling 1+ million records daily with high reliability and performance",
        "Designed and implemented database schemas for customer management systems supporting business growth",
        "Successfully integrated third-party payment APIs (Stripe, PayPal) ensuring secure and seamless transactions",
        "Implemented comprehensive automated testing achieving high code coverage and system stability",
        "Collaborated with cross-functional teams to deliver data-driven solutions and insights"
      ]
    },
    {
      id: "3",
      company: "StartupHub",
      role: "Junior Software Developer",
      location: "San Francisco, CA",
      duration: "2019 - 2021",
      points: [
        "Developed responsive web applications using Python Django framework with modern UI/UX principles",
        "Created automated testing suites achieving 85% code coverage, establishing foundation for quality assurance",
        "Gained expertise in version control workflows and collaborative development practices using Git",
        "Participated in daily standups, sprint planning, and agile development methodologies",
        "Contributed to frontend development using HTML, CSS, JavaScript, and responsive design principles"
      ]
    }
  ],
  skills: [
    { category: "Programming Languages", items: "Python, Java, JavaScript, Node.js, C#, C++" },
    { category: "Backend Technologies", items: "Django, Flask, Spring Boot, RESTful APIs, Microservices, Service Fabric" },
    { category: "Frontend Technologies", items: "React, HTML5, CSS3, JavaScript ES6+, Responsive Design" },
    { category: "Databases", items: "PostgreSQL, MySQL, MongoDB, Redis, Database Design & Optimization" },
    { category: "Cloud & DevOps", items: "AWS, Azure, Docker, Kubernetes, Jenkins, CI/CD, Git, Infrastructure as Code" },
    { category: "Development Tools", items: "VS Code, Postman, Jira, Confluence, Agile Methodologies, Code Review" }
  ],
  additionalInfo: {
    title: "KEY ACHIEVEMENTS & IMPACT",
    points: [
      "Performance Optimization: Achieved 40% reduction in API response times through database query optimization and caching strategies",
      "Scalability Enhancement: Successfully implemented microservices architecture supporting 10x user growth",
      "Team Leadership: Mentored junior developers and led technical discussions, fostering knowledge sharing and collaboration",
      "Quality Assurance: Established automated testing practices achieving 85%+ code coverage across multiple projects",
      "System Reliability: Maintained 99.9% uptime for critical business applications serving 100,000+ daily users"
    ]
  }
};