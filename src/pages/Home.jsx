import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  { icon: '⚡', title: 'Electrical', text: 'Lights, switches, wiring and the power problems you should not ignore.', color: 'service-amber' },
  { icon: '🚿', title: 'Plumbing', text: 'Leaks, taps, drains and those unexpected water emergencies.', color: 'service-blue' },
  { icon: '🪑', title: 'Furniture repair', text: 'Small fixes that make your furniture feel right again.', color: 'service-orange' },
  { icon: '✨', title: 'Home cleaning', text: 'A fresher space, with a little help from a reliable pro.', color: 'service-mint' },
];

const steps = [
  { number: '01', title: 'Tell us what needs fixing', text: 'Choose a service and share a few details about your home.' },
  { number: '02', title: 'We route your request', text: 'Your request is saved and made visible to the right team.' },
  { number: '03', title: 'Follow every update', text: 'Track progress in your workspace, from pending to completed.' },
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-shell">
        <div className="hero-grid-pattern" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div className="hero-copy animate-fade-in">
            <div className="eyebrow"><span className="eyebrow-dot" /> THE BETTER WAY TO CARE FOR YOUR HOME</div>
            <h1>Your home deserves <span>good hands.</span></h1>
            <p className="hero-lede">From the small fixes to the jobs you’ve been putting off, book trusted home-service professionals and keep every update in one simple place.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/submit" className="button-primary button-large">Book a service <span>↗</span></Link>
              <Link to="/services" className="button-secondary button-large">Explore services <span>→</span></Link>
            </div>
            <div className="hero-proof-row">
              <div className="avatar-stack"><span>AK</span><span>SM</span><span>UR</span><b>+</b></div>
              <div><div className="star-line">★★★★★ <span>Designed around real homes</span></div><p>One place to request, manage and track home repairs.</p></div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Illustration of a home service request dashboard">
            <div className="visual-blob visual-blob-one" /><div className="visual-blob visual-blob-two" />
            <div className="home-illustration-card">
              <div className="illustration-topline"><div><span className="tiny-label">YOUR HOME</span><h3>Looking good.</h3></div><span className="sun-icon">☼</span></div>
              <div className="house-scene">
                <div className="scene-sun" /><div className="scene-cloud cloud-a" /><div className="scene-cloud cloud-b" />
                <div className="scene-house"><div className="scene-roof" /><div className="scene-wall"><div className="scene-window window-left" /><div className="scene-window window-right" /><div className="scene-door" /></div><div className="scene-path" /></div>
                <div className="scene-plant plant-left">♣</div><div className="scene-plant plant-right">♣</div>
              </div>
              <div className="request-mini-card"><div className="mini-icon">🔧</div><div className="min-w-0 flex-1"><p className="mini-title">Kitchen tap repair</p><p className="mini-subtitle">Request #NC-2048 · Just now</p></div><span className="status-pill">Received</span></div>
              <div className="progress-mini"><div className="progress-label"><span>Request progress</span><strong>01 <small>/ 03</small></strong></div><div className="progress-track"><span /></div><div className="progress-foot"><span>Submitted</span><span>In progress</span><span>Completed</span></div></div>
            </div>
            <div className="floating-note floating-note-top"><span className="floating-note-icon green">✓</span><div><strong>Request received</strong><small>You’re all set</small></div></div>
            <div className="floating-note floating-note-bottom"><span className="floating-note-icon violet">✳</span><div><strong>One simple workspace</strong><small>Every detail, together</small></div></div>
            <div className="visual-sparkle sparkle-one">✦</div><div className="visual-sparkle sparkle-two">✧</div>
          </div>
        </div>
        <div className="hero-bottom-line"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-4 py-5 sm:gap-10 sm:px-6 lg:px-8"><span>MADE FOR EVERYDAY HOME CARE</span><i /> <span>Transparent updates</span><i /> <span>Local professionals</span><i /> <span>Simple booking</span></div></div>
      </section>

      <section className="section-wrap mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="section-heading-row"><div><p className="section-kicker">WHAT CAN WE HELP WITH?</p><h2>Little fixes. Big relief.</h2><p className="section-subtitle">Find the right kind of help for the things that keep your home running.</p></div><Link to="/services" className="text-link hidden sm:inline-flex">See all services <span>↗</span></Link></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => <Link to="/services" key={service.title} className={`home-service-card ${service.color}`}><div className="home-service-card-top"><span className="service-emoji">{service.icon}</span><span className="service-arrow">↗</span></div><p className="service-number">0{index + 1} / HOME CARE</p><h3>{service.title}</h3><p className="home-service-description">{service.text}</p><span className="service-card-link">Explore service <span>→</span></span></Link>)}
        </div>
        <div className="all-service-note"><span className="note-spark">✦</span><p>Not sure what category your job fits? <strong>General maintenance</strong> covers the in-between tasks, too.</p><Link to="/services">Browse the directory →</Link></div>
      </section>

      <section className="how-section">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-24">
          <div className="how-intro"><p className="section-kicker">SIMPLE FROM START TO FINISH</p><h2>Help for your home, without the hassle.</h2><p>We keep your request details, service status and important updates together, so you always know where things stand.</p><Link to="/register" className="button-dark mt-7">Create your free account <span>↗</span></Link></div>
          <div className="steps-list">{steps.map((step) => <div className="step-row" key={step.number}><span className="step-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><span className="step-chevron">↗</span></div>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"><div className="bottom-cta"><div className="cta-decoration cta-decoration-one" /><div className="cta-decoration cta-decoration-two" /><div className="relative z-10"><p className="section-kicker !text-emerald-200">A BETTER HOME STARTS HERE</p><h2>Ready to cross that fix off your list?</h2><p>Get your request started in just a few minutes.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/submit" className="button-white">Book a service <span>↗</span></Link><Link to="/services" className="button-ghost-light">Browse services</Link></div></div></div></section>
      <footer className="home-footer"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><div className="brand-lockup"><span className="brand-mark brand-mark-small"><span>n</span><i /></span><span className="brand-copy"><strong>NestCare</strong><small>HOME SERVICES, MADE SIMPLE</small></span></div><p>One less thing to worry about. © {new Date().getFullYear()} NestCare</p><Link to="/login">Team & customer sign in ↗</Link></div></footer>
    </div>
  );
}
