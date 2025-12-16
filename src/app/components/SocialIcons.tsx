import { memo } from "react";

interface SocialIconsProps {
  className?: string;
  iconSize?: string;
}

const SocialIcons = memo(function SocialIcons({ className = "", iconSize = "w-5 h-5" }: SocialIconsProps) {
  // Use CSS hover instead of JavaScript for SSR compatibility
  const baseClasses = `${className || "text-white"} no-underline social-icon-hover`;
  
  return (
    <>
      <a 
        className={`${baseClasses} mr-2`} 
        href="https://www.instagram.com/pt_fabiole" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Instagram"
      >
        <i className={`fab fa-instagram ${iconSize}`}></i>
      </a>
      <a 
        className={`${baseClasses} mr-2`} 
        href="https://www.facebook.com/fabiole13" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Facebook"
      >
        <i className={`fab fa-facebook-f ${iconSize}`}></i>
      </a>
      <a 
        className={`${baseClasses} mr-2`} 
        href="https://www.linkedin.com/in/fabio-le" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="LinkedIn"
      >
        <i className={`fab fa-linkedin-in ${iconSize}`}></i>
      </a>
      <a 
        className={`${baseClasses} mr-2`} 
        href="https://www.youtube.com/channel/UCaVEJUlceBfmF-6GxKYeqhQ" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="YouTube"
      >
        <i className={`fab fa-youtube ${iconSize}`}></i>
      </a>
      <a 
        className={`${baseClasses}`} 
        href="https://chat.whatsapp.com/Bzf2RZ500Ef2lOEcuu6m2S" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="WhatsApp"
      >
        <i className={`fab fa-whatsapp ${iconSize}`}></i>
      </a>
    </>
  );
});

SocialIcons.displayName = "SocialIcons";

export default SocialIcons;
