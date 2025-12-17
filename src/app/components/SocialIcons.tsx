import { memo } from "react";

interface SocialIconsProps {
  className?: string; // Additional classes (usually margins or background contexts)
  iconSize?: string;
}

const SocialIcons = memo(function SocialIcons({ className = "", iconSize = "w-5 h-5" }: SocialIconsProps) {
  // Use CSS hover instead of JavaScript for SSR compatibility
  // Removed explicit "text-white" default to allow brand colors to shine through, 
  // but if className provides text-color it might override. 
  // We will force brand colors directly on the icons.

  const baseClasses = `${className} no-underline transition-transform duration-200 hover:-translate-y-1`;

  return (
    <>
      <a
        className={`${baseClasses} mr-2`}
        href="https://www.instagram.com/pt_fabiole"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <i className={`fab fa-instagram ${iconSize} text-[#E1306C]`}></i>
      </a>
      <a
        className={`${baseClasses} mr-2`}
        href="https://www.facebook.com/fabiole13"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <i className={`fab fa-facebook-f ${iconSize} text-[#1877F2]`}></i>
      </a>
      <a
        className={`${baseClasses} mr-2`}
        href="https://www.linkedin.com/in/fabio-le"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <i className={`fab fa-linkedin-in ${iconSize} text-[#0A66C2]`}></i>
      </a>
      <a
        className={`${baseClasses} mr-2`}
        href="https://www.youtube.com/channel/UCaVEJUlceBfmF-6GxKYeqhQ"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
      >
        <i className={`fab fa-youtube ${iconSize} text-[#FF0000]`}></i>
      </a>
      <a
        className={`${baseClasses}`}
        href="https://chat.whatsapp.com/Bzf2RZ500Ef2lOEcuu6m2S"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <i className={`fab fa-whatsapp ${iconSize} text-[#25D366]`}></i>
      </a>
    </>
  );
});

SocialIcons.displayName = "SocialIcons";

export default SocialIcons;
