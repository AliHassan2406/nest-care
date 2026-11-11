import React from "react";

export function SvgIcon({ children, className = "", title }) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
    >
      {title ? <span className="sr-only">{title}</span> : null}
      {children}
    </span>
  );
}

export function RepairIcon(props) {

  return (
    <SvgIcon {...props}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8"
      >
        <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6L3 18l6.4-6.1a4 4 0 0 0 5.6-5.6z" />
        <path d="M20 10l-2 2" />
      </svg>
    </SvgIcon>
  );
}

export function DashboardIcon({ className = "" }) {
  return (
    <SvgIcon className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 3h7v7H3z" />
        <path d="M14 3h7v7h-7z" />
        <path d="M14 14h7v7h-7z" />
        <path d="M3 14h7v7H3z" />
      </svg>
    </SvgIcon>
  );
}

export function SubmitIcon({ className = "" }) {
  return (
    <SvgIcon className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    </SvgIcon>
  );
}

export function ServicesIcon({ className = "" }) {
  return (
    <SvgIcon className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 6h-8" />
        <path d="M14 6l2 2" />
        <path d="M12 2v20" />
        <path d="M4 6h8" />
        <path d="M4 10h8" />
        <path d="M4 14h8" />
      </svg>
    </SvgIcon>
  );
}

export function AdminIcon({ className = "" }) {
  return (
    <SvgIcon className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3 7.5 5 7.5 7.5 9.5 12 12 12z" />
        <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
      </svg>
    </SvgIcon>
  );
}

export function WhatsAppIcon({ className = "" }) {
  return (
    <SvgIcon className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.5 3.5A10.9 10.9 0 0 0 3.2 17l-1.2 4.5 4.6-1.1A10.9 10.9 0 0 0 20.5 3.5Zm-9.1 15.2c-1.5 0-2.9-.4-4.2-1.2l-.3-.2-2.5.6.7-2.4-.2-.3c-.8-1.2-1.2-2.6-1.2-4.1 0-4.1 3.4-7.4 7.4-7.4 4.1 0 7.4 3.4 7.4 7.4 0 4.1-3.3 7.4-7.1 7.4Zm4.4-5.6c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.9.9-.2.2-.4.2-.6.1-.2-.1-.8-.3-1.5-.9-.6-.5-1.1-1.2-1.2-1.4-.1-.2 0-.4.1-.5.1-.1.2-.2.3-.4.1-.1.1-.3.2-.4 0-.1 0-.3-.1-.4-.1-.1-.6-1.6-.9-1.7-.2-.2-.4-.2-.6-.1h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.2.9 2.4 1 2.5.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.7.1.5-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1z"/>
      </svg>
    </SvgIcon>
  );
}

export function EmailIcon({ className = "" }) {
  return (
    <SvgIcon className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4 4h16v16H4z" />
        <path d="m4 6 8 7 8-7" />
      </svg>
    </SvgIcon>
  );
}

export function StatusIcon({ status, className = "" }) {
  const base = { className: `w-4 h-4 ${className}` };
  if (status === "Pending") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" {...base}>
        <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 14h-2v-6h2v6Zm0-8h-2V6h2v2Z" />
      </svg>
    );
  }
  if (status === "In Progress") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" {...base}>
        <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm1 11h4v-2h-3V7h-2v6Z" />
      </svg>
    );
  }
  if (status === "Completed") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" {...base}>
        <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm-1 15-4-4 1.4-1.4L11 14.2l5.6-5.6L18 10l-7 7Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

