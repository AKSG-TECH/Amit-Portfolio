import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "./lib/firebase";
import heroImage from "./hero.png";
import { 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  Twitter, 
  Menu, 
  X, 
  ChevronRight, 
  Briefcase, 
  GraduationCap, 
  User, 
  Code, 
  ExternalLink,
  ArrowUp,
  Award,
  Users
} from "lucide-react";

// Types
interface Project {
  title: string;
  description: string;
  tech: string[];
  link?: string;
}

interface Experience {
  company: string;
  role: string;
  duration: string;
  responsibilities: string[];
}

interface Education {
  degree: string;
  school: string;
  year: string;
}

interface Skill {
  name: string;
  percentage: number;
}

// Data
const projects: Project[] = [
  {
    title: "Courier Tracking System",
    description: "A full-featured shipment tracking web application with admin panel, branch logins, and live consignment tracking.",
    tech: ["HTML", "CSS", "JS", "Supabase"],
    link: "https://xpeed.aiom.in/",
  },
  {
    title: "Shipping Label Generator",
    description: "Thermal-print optimized label generator with barcodes, QR codes, and instant print support.",
    tech: ["HTML", "CSS", "JS"],
    link: "https://xpeed.aiom.in/",
  },
  {
    title: "CSC Service Portal",
    description: "Join CSC 2021 | Amit Kumar Sahu Gupta | CSC ID: 377521540015. Modern dashboard UI design for digital services.",
    tech: ["HTML", "CSS", "JS"],
    link: "https://digitalseva.csc.gov.in/",
  },
  {
    title: "Personal Portfolio",
    description: "The very website you are browsing. Modern, responsive, and animated.",
    tech: ["React", "Tailwind", "Motion"],
  },
];

const experiences: Experience[] = [
  {
    company: "Raj Express Enterprise",
    role: "Operational Associate",
    duration: "May 2025 – April 2026",
    responsibilities: [
      "Parcel booking and e-way bill generation",
      "Billing and customer support management",
      "Live shipment tracking and documentation",
    ],
  },
  {
    company: "Adani Wilmar Ltd (SCG Enterprise)",
    role: "Supervisor",
    duration: "Aug 2024 – Mar 2025",
    responsibilities: [
      "Packaging supervision and quality control",
      "Team management and workflow optimization",
      "Safety compliance monitoring",
    ],
  },
  {
    company: "CSC e-Governance",
    role: "Village Level Entrepreneur (VLE)",
    duration: "June 2021 – Present",
    responsibilities: [
      "CSC ID: 377521540015",
      "Aadhaar and PAN card services",
      "Ayushman card and rural digital services",
      "Government service coordination",
    ],
  },
  {
    company: "NREGA",
    role: "Project Associate",
    duration: "April 2022 – March 2023",
    responsibilities: [
      "Rural employment project management",
      "Field monitoring and resource coordination",
    ],
  },
];

const education: Education[] = [
  {
    degree: "B.Com",
    school: "IGNOU",
    year: "2024",
  },
  {
    degree: "Advanced Diploma in Computer Application",
    school: "Global Computer Institute",
    year: "2021",
  },
  {
    degree: "Intermediate",
    school: "Bihar Board",
    year: "2020",
  },
  {
    degree: "Matriculation",
    school: "Bihar Board",
    year: "2018",
  },
];

const skills: Skill[] = [
  { name: "HTML", percentage: 95 },
  { name: "CSS", percentage: 90 },
  { name: "JavaScript", percentage: 85 },
  { name: "Excel", percentage: 95 },
  { name: "MS Word", percentage: 98 },
  { name: "Photoshop", percentage: 80 },
  { name: "Tally", percentage: 85 },
  { name: "Project Management", percentage: 92 },
  { name: "Team Leadership", percentage: 90 },
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    message: ""
  });

  const validateForm = () => {
    const errors = { name: "", email: "", message: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.message.trim()) {
      errors.message = "Message cannot be empty";
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters long";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // 1. Save to Firestore
      const path = 'contact_submissions';
      try {
        await addDoc(collection(db, path), {
          ...formData,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        // We log and handle firestore error but continue to API if needed
        handleFirestoreError(error, OperationType.CREATE, path);
      }

      // 2. Send to API for potential Google Sheet integration
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      // Reset status after a few seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
      
      const sections = ["home", "about", "skills", "experience", "projects", "education", "contact"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    
    // Using a tiny timeout to ensure the menu state change doesn't interfere 
    // with the calculation if layout shifts occur
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const navbarHeight = 80; // Standard offset for the fixed header
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop - navbarHeight;

        window.scrollTo({
          top: id === 'home' ? 0 : targetPosition,
          behavior: "smooth"
        });
      }
    }, 10);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-dark border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold font-display cursor-pointer"
              onClick={() => scrollToSection("home")}
            >
              <span className="gradient-text">Amit Sahu</span>
            </motion.div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {["Home", "About", "Skills", "Experience", "Projects", "Education", "Contact"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`text-sm font-medium transition-all hover:text-blue-400 relative py-2 ${
                    activeSection === item.toLowerCase() ? "text-blue-400" : "text-slate-400"
                  }`}
                >
                  {item}
                  {activeSection === item.toLowerCase() && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Nav Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[-1]"
              />
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden glass-dark border-t border-white/10 overflow-hidden shadow-2xl"
              >
                <div className="px-4 py-6 space-y-2">
                  {["Home", "About", "Skills", "Experience", "Projects", "Education", "Contact"].map((item, i) => (
                    <motion.button
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className={`block w-full text-left px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        activeSection === item.toLowerCase() 
                        ? "bg-blue-500/10 text-blue-400" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10 pt-24">
        {/* Hero Section */}
        <section id="home" className="min-h-[calc(100vh-64px)] flex items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-blue-400 font-mono text-sm tracking-widest uppercase mb-4">Welcome to my world</h2>
              <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-6">
                Hi, I'm <span className="gradient-text">Amit</span>
              </h1>
              <div className="h-12 mb-6">
                <TypingEffect />
              </div>
              <p className="text-xl text-slate-400 max-w-lg mb-8 leading-relaxed">
                Motivated professional with experience in supervision, project coordination, 
                government services, and web development. Based in Gopalganj, Bihar.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection("contact")}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-shadow hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  Contact Me
                </motion.button>
                <motion.a
                  href="/Amit.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 border border-white/20 hover:bg-white/5 text-white font-semibold rounded-full flex items-center gap-2 cursor-pointer"
                >
                  <Download size={20} />
                  Download CV
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex justify-center items-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-30"></div>
                <div className="relative w-80 h-96 rounded-3xl glass overflow-hidden flex items-center justify-center border border-white/20 shadow-2xl">
                  <img 
                    src={heroImage} 
                    alt="Amit Sahu" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -right-6 p-4 glass rounded-2xl animate-bounce pointer-events-none z-10">
                    <Code className="text-blue-400" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 p-4 glass rounded-2xl animate-pulse pointer-events-none z-10">
                    <Briefcase className="text-purple-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="About Me" subtitle="Who I am" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <motion.div
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : -50 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <p className="text-lg text-slate-300 leading-relaxed">
                  I am a motivated professional with a diverse background in project supervision, 
                  rural governance (CSC VLE), and technology. My journey has been driven by a passion 
                  for learning and a commitment to excellence in every role I undertake.
                </p>
                <p className="text-lg text-slate-400 leading-relaxed">
                  With a B.Com degree from IGNOU and an ADCA Diploma, I bridge the gap between 
                  administrative expertise and technical proficiency. I enjoy creating solutions 
                  that solve real-world problems.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 glass rounded-xl">
                    <h4 className="text-blue-400 font-bold text-2xl mb-1">4+</h4>
                    <p className="text-slate-400 text-sm italic">Years Experience</p>
                  </div>
                  <div className="p-4 glass rounded-xl">
                    <h4 className="text-purple-400 font-bold text-2xl mb-1">500+</h4>
                    <p className="text-slate-400 text-sm italic">Rural Clients Served</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 50 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 gap-6"
              >
                <FeatureCard 
                  icon={<GraduationCap className="text-blue-400" />}
                  title="Education"
                  description="B.Com Graduate (IGNOU 2024) & ADCA Diploma Holder."
                />
                <FeatureCard 
                  icon={<Award className="text-purple-400" />}
                  title="Certifications"
                  description="Expertise in MS Office, Tally, and Web Development."
                />
                <FeatureCard 
                  icon={<Users className="text-emerald-400" />}
                  title="Leadership"
                  description="Proven track record in team management at Adani Wilmar."
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="My Skills" subtitle="What I'm good at" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {skills.map((skill, index) => (
                <SkillItem key={skill.name} skill={skill} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Experience" subtitle="Professional journey" />
            
            <div className="space-y-12 relative before:absolute before:left-0 md:before:left-1/2 before:w-px before:h-full before:bg-white/10 before:-translate-x-1/2">
              {experiences.map((exp, index) => (
                <ExperienceItem key={exp.company} exp={exp} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Recent Projects" subtitle="My creations" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <ProjectCard key={project.title} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Education" subtitle="Learning path" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {education.map((edu, index) => (
                <EducationCard key={edu.degree} edu={edu} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Contact Me" subtitle="Let's talk" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="glass p-8 rounded-3xl space-y-6">
                  <h3 className="text-2xl font-bold font-display">Get in Touch</h3>
                  <p className="text-slate-400 italic">I'm always open to new opportunities and collaborations.</p>
                  
                  <div className="space-y-4">
                    <ContactInfo icon={<Mail className="text-blue-400" />} text="mr.amitkumarsahugupta@gmail.com" />
                    <ContactInfo icon={<Phone className="text-purple-400" />} text="+91 87092 52178" />
                    <ContactInfo icon={<MapPin className="text-emerald-400" />} text="Mayur Vihar Phase III, Sector 62, Delhi, India" />
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <SocialIcon icon={<Linkedin />} href="#" />
                    <SocialIcon icon={<Twitter />} href="#" />
                    <SocialIcon icon={<Github />} href="#" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
              >
                <form className="glass p-8 rounded-3xl space-y-4" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 px-1">Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          formErrors.name ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-blue-500/50"
                        }`} 
                        placeholder="Enter your full name" 
                      />
                      {formErrors.name && <p className="text-red-400 text-xs mt-1 px-1">{formErrors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 px-1">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          formErrors.email ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-blue-500/50"
                        }`} 
                        placeholder="email@example.com" 
                      />
                      {formErrors.email && <p className="text-red-400 text-xs mt-1 px-1">{formErrors.email}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 px-1">Message</label>
                    <textarea 
                      name="message"
                      rows={4} 
                      value={formData.message}
                      onChange={handleInputChange}
                      className={`w-full bg-white/5 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                        formErrors.message ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-blue-500/50"
                      }`} 
                      placeholder="Your message here..."
                    ></textarea>
                    {formErrors.message && <p className="text-red-400 text-xs mt-1 px-1">{formErrors.message}</p>}
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 ${
                      isSubmitting ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                  
                  {submitStatus === "success" && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-emerald-400 text-sm text-center font-medium bg-emerald-500/10 py-2 rounded-lg"
                    >
                      Message sent successfully!
                    </motion.p>
                  )}
                  {submitStatus === "error" && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm text-center font-medium bg-red-500/10 py-2 rounded-lg"
                    >
                      Something went wrong. Please try again.
                    </motion.p>
                  )}
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} Amit Kumar Sahu Gupta. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm font-medium">
              Designed by <span className="text-blue-400">Amit Kumar Sahu Gupta</span>
            </p>
            <div className="flex space-x-6 text-slate-500">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg z-50 hover:bg-blue-700 transition-all"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Components
const TypingEffect: React.FC = () => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = ["Web Developer", "Supervisor", "CSC VLE", "Project Associate"];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, words]);

  return (
    <p className="text-2xl md:text-3xl text-slate-300 font-display min-h-[1.5em]">
      {text}<span className="border-r-2 border-blue-500 animate-[blink_1s_infinite]"></span>
    </p>
  );
};

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-16">
      <motion.p
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        viewport={{ once: true }}
        className="text-blue-400 font-mono text-sm tracking-widest uppercase mb-2"
      >
        {subtitle}
      </motion.p>
      <motion.h2
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold font-display"
      >
        {title}
      </motion.h2>
      <motion.div
        whileInView={{ width: 80 }}
        initial={{ width: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="h-1 bg-linear-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"
      />
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <div className="glass p-6 rounded-2xl flex items-start gap-4">
      <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
      <div>
        <h4 className="text-lg font-bold mb-1">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const SkillItem: React.FC<{ skill: Skill; index: number }> = ({ skill, index }) => {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center px-1">
        <span className="font-medium text-slate-300">{skill.name}</span>
        <span className="text-slate-500 text-sm">{skill.percentage}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          whileInView={{ width: `${skill.percentage}%` }}
          initial={{ width: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 + index * 0.1 }}
          className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full"
        />
      </div>
    </motion.div>
  );
};

const ExperienceItem: React.FC<{ exp: Experience; index: number }> = ({ exp, index }) => {
  const isLeft = index % 2 === 0;
  return (
    <div className={`flex flex-col md:flex-row items-center gap-8 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-1 w-full">
        <motion.div
          whileInView={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : (isLeft ? 50 : -50) }}
          viewport={{ once: true }}
          className={`glass p-8 rounded-3xl relative ${isLeft ? 'md:text-right' : ''}`}
        >
          <div className={`absolute top-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] hidden md:block ${isLeft ? '-right-[10px] translate-x-1/2' : '-left-[10px] -translate-x-1/2'} -translate-y-1/2 z-20`}></div>
          <span className="text-blue-400 font-mono text-sm block mb-2">{exp.duration}</span>
          <h3 className="text-2xl font-bold mb-1">{exp.company}</h3>
          <p className="text-slate-400 font-medium mb-4">{exp.role}</p>
          <ul className={`space-y-2 text-slate-400 text-sm ${isLeft ? 'md:flex md:flex-col md:items-end' : ''}`}>
            {exp.responsibilities.map((res, i) => (
              <li key={i} className="flex items-start gap-2">
                {!isLeft && <ChevronRight size={16} className="mt-0.5 shrink-0 text-blue-500" />}
                <span>{res}</span>
                {isLeft && <ChevronRight size={16} className="mt-0.5 shrink-0 text-blue-500 hidden md:block" />}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
      <div className="md:w-12 shrink-0 flex justify-center z-10 md:hidden">
        <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      </div>
      <div className="flex-1 hidden md:block"></div>
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 30 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-3xl blur-[20px] opacity-0 group-hover:opacity-20 transition-opacity"></div>
      <div className="relative glass p-8 rounded-3xl h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
              <Code className="text-blue-400" />
            </div>
            <a 
              href={project.link || "#"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <ExternalLink size={20} />
            </a>
          </div>
          <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
          {project.tech.map((t) => (
            <span key={t} className="text-xs font-mono px-3 py-1 bg-white/5 text-slate-400 rounded-full">{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const EducationCard: React.FC<{ edu: Education; index: number }> = ({ edu, index }) => {
  return (
    <motion.div
      whileInView={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0.9 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="glass p-6 rounded-2xl border-l-4 border-blue-500/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <GraduationCap className="text-blue-400" size={24} />
        <span className="text-sm font-mono text-slate-500">{edu.year}</span>
      </div>
      <h3 className="text-lg font-bold mb-1">{edu.degree}</h3>
      <p className="text-slate-400 text-sm">{edu.school}</p>
    </motion.div>
  );
};


const ContactInfo: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => {
  return (
    <div className="flex items-start sm:items-center gap-4 group min-w-0">
      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors shrink-0">{icon}</div>
      <span className="text-slate-300 font-medium break-all sm:break-normal line-clamp-2 sm:line-clamp-none">{text}</span>
    </div>
  );
};

const SocialIcon: React.FC<{ icon: React.ReactNode; href: string }> = ({ icon, href }) => {
  return (
    <motion.a
      whileHover={{ y: -4, scale: 1.1 }}
      href={href}
      className="p-3 glass rounded-xl text-slate-400 hover:text-blue-400 transition-colors"
    >
      {icon}
    </motion.a>
  );
};


