'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Play,
  FileText,
  Bot,
  GraduationCap,
  ClipboardList,
  Target,
  Brain,
  Coins,
  Star,
  Gift
} from 'lucide-react';
import styles from './landing.module.css';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll(`.${styles.revealOnScroll}`);

    // Set initial hidden state via data attribute
    elements.forEach(el => {
      (el as HTMLElement).dataset.reveal = 'pending';
    });

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.dataset.reveal = 'visible';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    elements.forEach(el => {
      observer.observe(el);
    });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={`${styles.container} ${styles.navInner}`}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>B</span>
            Bravio
          </Link>

          <ul className={styles.navLinks}>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#testimonials">Reviews</a></li>
          </ul>

          <Link href="/register" className={styles.navCta}>Get Started Free</Link>

          <button className={`${styles.mobileMenuBtn} ${mobileMenuOpen ? styles.active : ''}`} onClick={toggleMobileMenu} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.active : ''}`}>
        <a href="#how-it-works" onClick={closeMobileMenu}>How It Works</a>
        <a href="#features" onClick={closeMobileMenu}>Features</a>
        <a href="#testimonials" onClick={closeMobileMenu}>Reviews</a>
        <Link href="/register" className={styles.navCta}>Get Started Free</Link>
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={`${styles.heroOrb} ${styles.heroOrb1}`}></div>
          <div className={`${styles.heroOrb} ${styles.heroOrb2}`}></div>
          <div className={styles.heroGrid}></div>
        </div>
        <div className={`${styles.container} ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              <Sparkles size={14} className={styles.badgeStar} />
              AI-Powered Learning Platform
            </span>
            <h1>Master Any Content <span className={styles.highlight}>10x Faster</span></h1>
            <p className={styles.heroSubtitle}>Upload any text and let our AI break it down into clear summaries, essential key points, and interactive flashcards - making complex content easy to understand and remember.</p>
            <div className={styles.heroButtons}>
              <Link href="/register" className={styles.btnPrimary}>
                Start Learning Free
                <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className={styles.btnSecondary}>
                <Play size={16} />
                See How It Works
              </a>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>150</div>
                <div className={styles.statLabel}>Free Broins to Start</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>3-in-1</div>
                <div className={styles.statLabel}>Summary + Key Points + Cards</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>&lt; 30s</div>
                <div className={styles.statLabel}>AI Processing Time</div>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.appPreview}>
              <div className={styles.appHeader}>
                <span className={styles.appTitle}>Bravio Practice Mode</span>
                <div className={styles.appDots}>
                  <span className={styles.appDot}></span>
                  <span className={styles.appDot}></span>
                  <span className={styles.appDot}></span>
                </div>
              </div>
              <div className={styles.flashcardPreview}>
                <div className={styles.flashcardProgress}>
                  <div className={styles.progressBarLanding}>
                    <div className={styles.progressFillLanding}></div>
                  </div>
                  <span className={styles.progressTextLanding}>3 / 5</span>
                </div>
                <div className={styles.flipCard}>
                  <div className={styles.flipCardFront}>
                    <span className={styles.cardLabelLanding}>Question</span>
                    <p className={styles.cardTextLanding}>What is the primary function of mitochondria in a cell?</p>
                    <span className={styles.flipHint}>Tap to reveal answer</span>
                  </div>
                </div>
                <div className={styles.difficultyButtons}>
                  <button className={`${styles.diffBtn} ${styles.hardBtn}`}>Hard</button>
                  <button className={`${styles.diffBtn} ${styles.goodBtn}`}>Good</button>
                  <button className={`${styles.diffBtn} ${styles.easyBtn}`}>Easy</button>
                </div>
              </div>
            </div>
            <div className={`${styles.floatingCard} ${styles.floatingCard1}`}>
              <div className={styles.floatingIcon}>
                <Target size={24} />
              </div>
              <div className={styles.floatingText}>Accuracy</div>
              <div className={styles.floatingValue}>94%</div>
            </div>
            <div className={`${styles.floatingCard} ${styles.floatingCard2}`}>
              <div className={styles.floatingIcon}>
                <Coins size={24} />
              </div>
              <div className={styles.floatingText}>Balance</div>
              <div className={styles.floatingValue}>150 Broins</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Simple Process</span>
            <h2 className={styles.sectionTitle}>How Bravio Works</h2>
            <p className={styles.sectionSubtitle}>Turn overwhelming content into digestible knowledge in just three easy steps.</p>
          </div>
          <div className={styles.stepsGrid}>
            <div className={`${styles.step} ${styles.revealOnScroll}`}>
              <div className={styles.stepIcon}>
                <FileText size={48} />
                <span className={styles.stepNumber}>1</span>
              </div>
              <h3>Upload Your Content</h3>
              <p>Paste any complex text - lecture notes, research papers, articles, or textbooks. Our platform handles content from 200 to 2,000 characters.</p>
            </div>
            <div className={`${styles.step} ${styles.revealOnScroll}`}>
              <div className={styles.stepIcon}>
                <Bot size={48} />
                <span className={styles.stepNumber}>2</span>
              </div>
              <h3>AI Breaks It Down</h3>
              <p>Our AI analyzes your content and generates a clear summary, extracts the most important key points, and creates smart flashcards - all in seconds.</p>
            </div>
            <div className={`${styles.step} ${styles.revealOnScroll}`}>
              <div className={styles.stepIcon}>
                <GraduationCap size={48} />
                <span className={styles.stepNumber}>3</span>
              </div>
              <h3>Understand & Remember</h3>
              <p>Read the summary to grasp the big picture, review key points for quick reference, and test yourself with flashcards to lock it in memory.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Platform Features</span>
            <h2 className={styles.sectionTitle}>Everything You Need to Learn Smarter</h2>
            <p className={styles.sectionSubtitle}>Powerful tools designed to simplify complex content and help you retain information longer.</p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={`${styles.featureCard} ${styles.revealOnScroll}`}>
              <div className={styles.featureIcon}>
                <ClipboardList size={28} />
              </div>
              <h3>Smart Summaries</h3>
              <p>Get concise, well-structured summaries that capture the essence of any content. Understand complex topics at a glance without reading walls of text.</p>
            </div>
            <div className={`${styles.featureCard} ${styles.revealOnScroll}`}>
              <div className={styles.featureIcon}>
                <Target size={28} />
              </div>
              <h3>Key Points Extraction</h3>
              <p>AI identifies and highlights the most important concepts, facts, and takeaways. Perfect for quick reviews and exam preparation.</p>
            </div>
            <div className={`${styles.featureCard} ${styles.revealOnScroll}`}>
              <div className={styles.featureIcon}>
                <Brain size={28} />
              </div>
              <h3>Interactive Flashcards</h3>
              <p>Test your understanding with AI-generated multiple-choice questions. Each answer includes detailed explanations to deepen your knowledge.</p>
            </div>
            <div className={`${styles.featureCard} ${styles.revealOnScroll}`}>
              <div className={styles.featureIcon}>
                <Coins size={28} />
              </div>
              <h3>Affordable Pay-As-You-Go</h3>
              <p>Start with 150 free Broins and only pay for what you use. Content costs scale with text length, keeping pricing transparent and fair.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials} id="testimonials">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Student Reviews</span>
            <h2 className={styles.sectionTitle}>Loved by Learners Everywhere</h2>
            <p className={styles.sectionSubtitle}>Join thousands of students who are already learning smarter with Bravio.</p>
          </div>
          <div className={styles.testimonialsGrid}>
            <div className={`${styles.testimonialCard} ${styles.revealOnScroll}`}>
              <div className={styles.testimonialStars}>
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
              </div>
              <p className={styles.testimonialText}>&ldquo;I used to spend hours reading dense research papers. Now I paste them into Bravio and get a clear summary with the key points highlighted. Game changer!&rdquo;</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}>SK</div>
                <div className={styles.testimonialInfo}>
                  <h5>Sarah K.</h5>
                  <p>Medical Student</p>
                </div>
              </div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.revealOnScroll}`}>
              <div className={styles.testimonialStars}>
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
              </div>
              <p className={styles.testimonialText}>&ldquo;The summaries help me understand concepts quickly, and the flashcards help me remember them. It&apos;s like having a study buddy that does the hard work for you.&rdquo;</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}>MJ</div>
                <div className={styles.testimonialInfo}>
                  <h5>Marcus J.</h5>
                  <p>Law Student</p>
                </div>
              </div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.revealOnScroll}`}>
              <div className={styles.testimonialStars}>
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
              </div>
              <p className={styles.testimonialText}>&ldquo;Complex engineering concepts broken down into digestible key points? Yes please! Bravio makes studying so much more efficient.&rdquo;</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}>EL</div>
                <div className={styles.testimonialInfo}>
                  <h5>Emma L.</h5>
                  <p>Engineering Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaBg}></div>
        <div className={`${styles.container} ${styles.ctaInner}`}>
          <h2>Start Learning <span className={styles.highlight}>Smarter</span> Today</h2>
          <p>Join thousands of students who are already turning complex content into clear summaries, key insights, and interactive flashcards. No credit card required.</p>
          <div className={styles.ctaButtons}>
            <Link href="/register" className={styles.btnPrimary}>
              Create Free Account
              <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className={styles.btnSecondary}>
              Watch Demo
            </a>
          </div>
          <div className={styles.ctaBonus}>
            <Gift size={18} />
            Get <strong>150 free Broins</strong> when you sign up today
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>B</span>
            Bravio
          </Link>
          <ul className={styles.footerLinks}>
            <li><a href="#">About</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
          <p className={styles.footerCopyright}>© 2025 Bravio. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
