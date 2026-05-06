import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export default function Card({ children, className = "", padding = "md", hover = false }: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <div className={`bg-white rounded-xl border border-[#e5e7eb] ${hover ? 'hover:shadow-md transition-shadow' : ''} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 flex items-center justify-between ${className}`}>{children}</div>;
};

Card.Title = function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-lg font-bold text-[#171717] ${className}`}>{children}</h2>;
};

Card.Body = function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-4 pt-4 border-t border-[#e5e7eb] ${className}`}>{children}</div>;
};
