  var wsYearEl = document.getElementById('ws-year');
  if (wsYearEl) wsYearEl.textContent = new Date().getFullYear();

  // Hero selection animation + font upgrade
  window.addEventListener('load', function(){
    var titleWrap = document.getElementById('ws-hero-title-wrap');
    var cursorEl = titleWrap ? titleWrap.querySelector('.ws-hero-cursor') : null;
    if (!titleWrap) return;

    setTimeout(function(){
      titleWrap.classList.add('ws-hero-title-selected');
    }, 400);

    setTimeout(function(){
      document.documentElement.style.setProperty(
        '--ws-hero-font',
        '"Montserrat", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      );
    }, 1100);

    setTimeout(function(){
      titleWrap.classList.add('ws-hero-title-done');
      if (cursorEl) cursorEl.style.opacity = '0';
    }, 1600);
  });

  const DEMO_FILES = {
    coffee: { before: 'demos/coffee-before.html', after: 'demos/coffee-after.html' },
    game:   { before: 'demos/game-before.html',   after: 'demos/game-after.html' }
  };

  function setIframeSrc(iframe, url){
    iframe.setAttribute('src', url);
  }

  (function initDemos(){
    const coffeeIframe = document.getElementById('iframe-coffee');
    const gameIframe = document.getElementById('iframe-game');
    if (coffeeIframe) setIframeSrc(coffeeIframe, DEMO_FILES.coffee.before);
    if (gameIframe) setIframeSrc(gameIframe, DEMO_FILES.game.before);

    // Tracks whether each demo has shown the "generating" illusion already (per demo, not global)
    const demoSeenGenerate = {
      coffee: false,
      game: false
    };

    function ensureLoader(layout){
      let loader = layout.querySelector('.ws-demo-loader');
      if (loader) return loader;

      loader = document.createElement('div');
      loader.className = 'ws-demo-loader';
      loader.innerHTML = `
        <div class="ws-demo-loader-inner" role="status" aria-live="polite">
          <div class="ws-demo-loader-brand" aria-hidden="true">
            <img
              src="assets/logo.png"
              alt=""
              class="ws-demo-loader-logo"
            />
            <div class="ws-demo-loader-name">WebSpark</div>
          </div>
          <p class="ws-demo-loader-title">Generating redesign…</p>
          <p class="ws-demo-loader-sub">Rebuilding layout, hierarchy, and spacing</p>
          <div class="ws-demo-loader-bar"></div>
        </div>
      `;
      layout.appendChild(loader);
      return loader;
    }

    function setIframeSrcWithFade(iframe, url){
      if (!iframe) return;

      // Fade out quickly before the swap
      iframe.classList.add('ws-demo-fade');

      // When iframe finishes loading, fade back in
      const onLoad = () => {
        requestAnimationFrame(() => {
          iframe.classList.remove('ws-demo-fade');
        });
      };
      iframe.addEventListener('load', onLoad, { once:true });

      // Swap src
      setIframeSrc(iframe, url);
    }

    document.querySelectorAll('.ws-demo-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const which = btn.getAttribute('data-demo');
        const layout = document.getElementById('demo-' + which);
        const iframe = document.getElementById('iframe-' + which);
        if (!layout || !iframe || !DEMO_FILES[which]) return;

        const isCurrentlyImproved = layout.classList.contains('is-improved');
        const wantsImprove = !isCurrentlyImproved;

        // Always allow instant return to "Before"
        if (!wantsImprove){
          layout.classList.remove('is-improved');
          layout.classList.remove('is-generating');

          const stateEl = layout.querySelector('.ws-demo-state');
          if (stateEl) stateEl.textContent = 'Before';

          const textEl = btn.querySelector('.ws-toggle-text');
          if (textEl) textEl.textContent = 'Click to improve';

          setIframeSrcWithFade(iframe, DEMO_FILES[which].before);
          return;
        }

        // Wants to go to "After"
        const stateEl = layout.querySelector('.ws-demo-state');
        const textEl = btn.querySelector('.ws-toggle-text');

        // If we've already shown the "generating" illusion for this demo, switch instantly
        if (demoSeenGenerate[which]){
          layout.classList.add('is-improved');
          if (stateEl) stateEl.textContent = 'After';
          if (textEl) textEl.textContent = 'Back to before';
          setIframeSrcWithFade(iframe, DEMO_FILES[which].after);
          return;
        }

        // First time for THIS demo: show unique branded "generating" screen briefly
        ensureLoader(layout);
        demoSeenGenerate[which] = true;

        layout.classList.add('is-generating');
        btn.disabled = true;

        // Set label early so the user sees intent immediately
        if (stateEl) stateEl.textContent = 'Generating…';
        if (textEl) textEl.textContent = 'Generating…';

        // Delay length: tuned to feel "real" but not annoying
        const delayMs = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 350
          : 950;

        setTimeout(() => {
          layout.classList.remove('is-generating');
          layout.classList.add('is-improved');

          if (stateEl) stateEl.textContent = 'After';
          if (textEl) textEl.textContent = 'Back to before';

          setIframeSrcWithFade(iframe, DEMO_FILES[which].after);

          btn.disabled = false;
        }, delayMs);
      });
    });
  })();

  (function attachCTAParallax(){
    const cta = document.getElementById('ws-cta-final');
    if (!cta) return;

    const shapes = cta.querySelectorAll('.ws-cta-shape');
    let lastScrollY = window.scrollY;
    let lastProgress = 0;

    function baseProgressFromRect(rect){
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const start = vh;
      const end = vh * 0.2;
      const t = (start - rect.top) / (start - end);
      return Math.max(0, Math.min(1, t));
    }

    function update(){
      const rect = cta.getBoundingClientRect();
      const base = baseProgressFromRect(rect);

      const scrollY = window.scrollY;
      const down = scrollY >= lastScrollY;

      let progress = down ? Math.max(lastProgress, base) : base;
      progress = Math.max(0, Math.min(1, progress));

      lastProgress = progress;
      lastScrollY = scrollY;

      shapes.forEach((shape) => {
        const maxX = parseFloat(shape.getAttribute('data-x')) || 0;
        const maxY = parseFloat(shape.getAttribute('data-y')) || 0;
        const tx = maxX * progress;
        const ty = maxY * progress;
        const rot = getComputedStyle(shape).getPropertyValue('--rot') || '0deg';
        shape.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot})`;
      });
    }

    window.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', update);
    update();
  })();
  
  /* ============================================================
     REDESIGN BUTTON: full page “different company” vibes
     + Screen transformation effect (added)
     ============================================================ */

  (function wsRedesignController(){
    const htmlEl = document.documentElement;
    const controls = document.getElementById('ws-redesign-controls');
    const firstBtn = document.getElementById('ws-btn-first');

    if (!controls || !firstBtn) return;

    // ---- Screen transform helper (added) ----
    function runScreenTransform(applyFn){
      // Respect reduced motion
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion){
        applyFn();
        return;
      }

      const fx = document.createElement('div');
      fx.className = 'ws-screenfx';
      document.body.appendChild(fx);

      // Start animation next frame so styles apply
      requestAnimationFrame(() => {
        fx.classList.add('is-run');
      });

      // Apply theme near the “peak” of the effect
      // (must happen while the overlay is fully visible)
      const APPLY_AT_MS = 260; // ~ half of 520ms
      const END_AT_MS = 560;   // cleanup after animation finishes

      window.setTimeout(() => {
        try { applyFn(); } catch (e) { /* fail silent */ }
      }, APPLY_AT_MS);

      window.setTimeout(() => {
        if (fx && fx.parentNode) fx.parentNode.removeChild(fx);
      }, END_AT_MS);
    }

    // Capture original text + src values so "Back to original" is exact.
    const original = {
      texts: {},
      srcs: {},
      heroFont: getComputedStyle(htmlEl).getPropertyValue('--ws-hero-font'),
      htmlClass: htmlEl.className
    };

    document.querySelectorAll('[data-ws-text]').forEach((el) => {
      const key = el.getAttribute('data-ws-text');
      original.texts[key] = el.innerHTML;
    });
    document.querySelectorAll('[data-ws-src]').forEach((el) => {
      const key = el.getAttribute('data-ws-src');
      original.srcs[key] = el.getAttribute('src');
    });

    const THEMES = [
      {
        id: 'ws-theme-cyber',
        label: 'Cyber',
        emoji: '',
        content: {
          heroTitle: 'WebSpark rebuilds your site<br>into a <span class="ws-hero-highlight">conversion-ready interface.</span>',
          heroSub: 'Think of it like refactoring — but for perception. Same business. A clearer story. A layout that feels engineered, not improvised.',
          heroCta: 'Start the rebuild',
          heroMeta1: '<strong>Signal-first</strong> hierarchy that reads fast.',
          heroMeta2: 'Clean HTML/CSS you can host anywhere.',

          examplesKicker: 'Before / after patterns',
          examplesTitle: 'Structure is a trust protocol',
          examplesSub: 'When layout is deliberate, visitors stop guessing and start moving.',
          exampleTagA: 'Impact header',
          exampleTagB: 'Clean offer',
          exampleTagC: 'Balanced flow',

          benefitsKicker: 'Outcomes',
          benefitsTitle: 'What a WebSpark redesign is built to do',
          benefitsSub: 'Not “prettier.” More understandable. More credible. More likely to convert.',

          o1Kicker: 'Outcome 01',
          o1Title: 'Instant clarity',
          o1P: 'Your first screen should behave like a perfect summary: what you offer, who it’s for, and the next step — all readable in under five seconds.',
          o1L1: 'Headline that states the promise (not a vibe)',
          o1L2: 'Supporting line that explains, not repeats',
          o1L3: 'One primary action, positioned early',

          o2Kicker: 'Outcome 02',
          o2Title: 'Lower friction → more customers',
          o2P: 'Conversions drop when users are forced to interpret. WebSpark removes dead ends and decision fatigue so the page feels obvious to navigate.',
          o2L1: 'CTA placement that’s consistent and intentional',
          o2L2: 'Sections that flow: benefit → proof → action',
          o2L3: 'Spacing rhythm that keeps the page calm',

          o3Kicker: 'Outcome 03',
          o3Title: 'Trust through consistency',
          o3P: 'Trust isn’t a badge you add — it’s the result of alignment, typography discipline, and controlled color decisions repeated across the page.',
          o3L1: 'Type scale that looks designed (not default)',
          o3L2: 'Components that feel like one system',
          o3L3: 'Accessibility-friendly contrast and structure',

          o4Kicker: 'Outcome 04',
          o4Title: 'Brand that feels engineered',
          o4P: 'WebSpark strengthens brand identity by making every component speak the same design language: buttons, cards, headings, and spacing — one voice.',
          o4L1: 'Repeatable UI patterns (less visual noise)',
          o4L2: 'Accent color used like a tool, not paint',
          o4L3: 'Layout symmetry that reads as “professional”',

          o5Kicker: 'Outcome 05',
          o5Title: 'Search-friendly structure',
          o5P: 'Cleaner hierarchy helps both humans and crawlers. Strong headings, logical sections, and accessible markup improve comprehension and indexing.',
          o5L1: 'Correct heading order and clear sections',
          o5L2: 'Readable blocks that encourage scrolling',
          o5L3: 'Less clutter competing with your message',

          demoKicker: 'Interactive',
          demoTitle: 'Tap to see “before” become “after”',
          demoSub: 'Two sample sites. One idea: better hierarchy changes behavior.',
          demoCoffeeTitle: 'Local Coffee Site',
          demoGameTitle: 'Indie Game Launch Page',
          demoTag: 'Same content • sharper layout',
          demoTag2: 'Same content • sharper layout',

          howKicker: 'Workflow',
          howTitle: 'A redesign pipeline that stays in your control',
          howSub: 'You share what exists. WebSpark rebuilds the presentation. You receive clean output.',
          step1Title: 'Share the site',
          step1Text: 'Send a link or paste the current HTML.',
          step2Title: 'Rebuild the layout',
          step2Text: 'Hierarchy, spacing, typography, flow — redesigned.',
          step3Title: 'Deliver clean output',
          step3Text: 'HTML/CSS you can host anywhere and maintain easily.',
          howNote: 'Readable first. Beautiful second. Every decision intentional.',
          glanceKicker: 'System check',
          glance1Name: 'Message clarity',
          glance1Pill: 'High',
          glance2Name: 'CTA visibility',
          glance2Pill: 'Obvious',
          glance3Name: 'Layout symmetry',
          glance3Pill: 'Controlled',
          glance4Name: 'Noise',
          glance4Pill: 'Low',

          ctaTitle: 'Want your site to feel inevitable to navigate?',
          ctaSub: 'Let WebSpark rebuild the page so your offer is understood immediately — in clean HTML you own.',
          ctaBtn: 'Get started ↗'
        }
      },
      {
        id: 'ws-theme-playful',
        label: 'Playful',
        emoji: '',
        content: {
          heroTitle: 'Make your website<br><span class="ws-hero-highlight">easy to understand</span> in one glance.',
          heroSub: 'WebSpark takes what you already have and rebuilds it into a friendlier, cleaner experience — still your content, just way easier to follow.',
          heroCta: 'Let’s make it better',
          heroMeta1: '<strong>Clear sections</strong> that feel welcoming.',
          heroMeta2: 'Same message — smoother flow.',

          examplesKicker: 'Glow-up snapshots',
          examplesTitle: 'Same idea, way kinder layout',
          examplesSub: 'Visitors shouldn’t have to work to understand you.',
          exampleTagA: 'Big headline',
          exampleTagB: 'Simple choices',
          exampleTagC: 'Happy balance',

          benefitsKicker: 'What improves',
          benefitsTitle: 'Five wins you can feel immediately',
          benefitsSub: 'Less confusion, more trust, and a page that feels “put together.”',

          o1Kicker: 'Win 01',
          o1Title: 'Friendly first screen',
          o1P: 'The first screen should feel like a quick hello: what this is, who it helps, and what to click next.',
          o1L1: 'Clear headline that says the point',
          o1L2: 'Support line that explains it plainly',
          o1L3: 'One main button that stands out',

          o2Kicker: 'Win 02',
          o2Title: 'More “yes” moments',
          o2P: 'When the page is easy, people move forward. WebSpark reduces distractions so the next step feels natural.',
          o2L1: 'Fewer competing buttons',
          o2L2: 'Sections that flow in a comfy order',
          o2L3: 'Spacing that makes reading relaxing',

          o3Kicker: 'Win 03',
          o3Title: 'Trust that feels effortless',
          o3P: 'Consistency feels professional. Matching styles, tidy spacing, and calm color choices make the brand feel reliable.',
          o3L1: 'Typography that’s readable everywhere',
          o3L2: 'Components that match each other',
          o3L3: 'Clean alignment (no “messy” feeling)',

          o4Kicker: 'Win 04',
          o4Title: 'A stronger brand vibe',
          o4P: 'A brand is a set of repeated decisions. WebSpark makes buttons, headings, and cards feel like one family.',
          o4L1: 'One visual language across the page',
          o4L2: 'Accent color used on purpose',
          o4L3: 'Layout that looks designed, not random',

          o5Kicker: 'Win 05',
          o5Title: 'Cleaner structure helps discovery',
          o5P: 'Clear sections and headings help users and search engines understand what the page is about.',
          o5L1: 'Headings that make sense in order',
          o5L2: 'Content blocks that invite scrolling',
          o5L3: 'Less clutter fighting your message',

          demoKicker: 'Try it',
          demoTitle: 'Click to “clean it up”',
          demoSub: 'Two quick previews that show what better hierarchy looks like.',
          demoCoffeeTitle: 'Cute Café Page',
          demoGameTitle: 'Game Page (but tidy!)',
          demoTag: 'Same page • clearer design',
          demoTag2: 'Same page • clearer design',

          howKicker: 'How it works',
          howTitle: 'A simple three-step glow-up',
          howSub: 'Share the page, rebuild the layout, and get clean HTML/CSS back.',
          step1Title: 'Share the site',
          step1Text: 'Link it or send the HTML.',
          step2Title: 'Rebuild the layout',
          step2Text: 'Make it cleaner, calmer, and easier to read.',
          step3Title: 'Deliver clean output',
          step3Text: 'HTML/CSS you can host anywhere.',
          howNote: 'Less clutter. More clarity. Better first impressions.',
          glanceKicker: 'Quick check',
          glance1Name: 'First screen',
          glance1Pill: 'Clear',
          glance2Name: 'Buttons',
          glance2Pill: 'Easy',
          glance3Name: 'Reading',
          glance3Pill: 'Smooth',
          glance4Name: 'Clutter',
          glance4Pill: 'Low',

          ctaTitle: 'Ready for a friendlier first impression?',
          ctaSub: 'WebSpark rebuilds your layout so people instantly understand what you do — using clean HTML you control.',
          ctaBtn: 'Get started ↗'
        }
      },
      {
        id: 'ws-theme-editorial',
        label: 'Editorial',
        emoji: '',
        content: {
          heroTitle: 'WebSpark rebuilds websites<br>into <span class="ws-hero-highlight">clear, structured pages.</span>',
          heroSub: 'Less decoration. More meaning. WebSpark refines hierarchy, spacing, and typography so the page reads like a well-edited article.',
          heroCta: 'Request a redesign',
          heroMeta1: '<strong>Readable</strong> composition.',
          heroMeta2: 'Clean HTML/CSS, owned by you.',

          examplesKicker: 'Comparisons',
          examplesTitle: 'Design is editorial discipline',
          examplesSub: 'The best layouts feel inevitable: each section earns its place.',
          exampleTagA: 'Lead story',
          exampleTagB: 'Offer clarity',
          exampleTagC: 'Rhythm',

          benefitsKicker: 'Results',
          benefitsTitle: 'What improves when the page is edited',
          benefitsSub: 'Clarity produces trust; trust produces action.',

          o1Kicker: 'Result 01',
          o1Title: 'A stronger lead',
          o1P: 'The first screen becomes a tight summary: what you do, who it’s for, and what to do next.',
          o1L1: 'Headline with a real claim',
          o1L2: 'Supporting line with specifics',
          o1L3: 'One primary action, placed early',

          o2Kicker: 'Result 02',
          o2Title: 'Fewer distractions',
          o2P: 'A page that asks fewer questions converts better. WebSpark reduces competing elements so the path forward is clear.',
          o2L1: 'Consistent CTA placement',
          o2L2: 'Logical section order',
          o2L3: 'Spacing that improves comprehension',

          o3Kicker: 'Result 03',
          o3Title: 'Trust by consistency',
          o3P: 'Consistency is credibility: a restrained type scale, aligned grids, and predictable components.',
          o3L1: 'Typography that holds together',
          o3L2: 'Repeatable component design',
          o3L3: 'Accessible structure and contrast',

          o4Kicker: 'Result 04',
          o4Title: 'A more coherent brand',
          o4P: 'Brand strength comes from repeated choices. WebSpark makes those choices visible and consistent throughout the page.',
          o4L1: 'Unified styling system',
          o4L2: 'Accent used sparingly and strategically',
          o4L3: 'Composition that feels intentional',

          o5Kicker: 'Result 05',
          o5Title: 'Improved structure for search',
          o5P: 'Clear headings and sections improve understanding for users and crawlers. Structure is performance.',
          o5L1: 'Correct heading hierarchy',
          o5L2: 'Skimmable content blocks',
          o5L3: 'Reduced clutter and duplication',

          demoKicker: 'Preview',
          demoTitle: 'See structure take over',
          demoSub: 'Two examples that show how hierarchy changes perception.',
          demoCoffeeTitle: 'Local Coffee',
          demoGameTitle: 'Game Launch',
          demoTag: 'Same site • edited layout',
          demoTag2: 'Same site • edited layout',

          howKicker: 'Method',
          howTitle: 'A simple, controlled workflow',
          howSub: 'Start with what exists. Improve the presentation. Deliver clean output.',
          step1Title: 'Share the site',
          step1Text: 'Provide a link or current HTML.',
          step2Title: 'Rebuild the layout',
          step2Text: 'Refine hierarchy, spacing, and flow.',
          step3Title: 'Deliver clean output',
          step3Text: 'HTML/CSS you can host anywhere.',
          howNote: 'Clarity is the product. Aesthetics follow.',
          glanceKicker: 'Highlights',
          glance1Name: 'Hierarchy',
          glance1Pill: 'Strong',
          glance2Name: 'Flow',
          glance2Pill: 'Logical',
          glance3Name: 'Typography',
          glance3Pill: 'Controlled',
          glance4Name: 'Noise',
          glance4Pill: 'Reduced',

          ctaTitle: 'Want a page that reads cleanly?',
          ctaSub: 'WebSpark rebuilds your layout to make the message obvious — in HTML you own and can maintain.',
          ctaBtn: 'Get started ↗'
        }
      },
      {
        id: 'ws-theme-noir',
        label: 'Noir',
        emoji: '',
        content: {
          heroTitle: 'WebSpark turns your site<br>into a <span class="ws-hero-highlight">premium first impression.</span>',
          heroSub: 'High contrast. Tight spacing. Quiet confidence. WebSpark rebuilds your layout so the experience feels intentional and worth trusting.',
          heroCta: 'Start a premium redesign',
          heroMeta1: '<strong>Polished</strong> hierarchy with restraint.',
          heroMeta2: 'Clean HTML/CSS you keep.',

          examplesKicker: 'Transformations',
          examplesTitle: 'Luxury is clarity + restraint',
          examplesSub: 'Remove the noise and the value becomes obvious.',
          exampleTagA: 'Signature hero',
          exampleTagB: 'Offer focus',
          exampleTagC: 'Balance',

          benefitsKicker: 'Value',
          benefitsTitle: 'Five outcomes that signal quality',
          benefitsSub: 'A premium feel comes from controlled decisions repeated everywhere.',

          o1Kicker: 'Outcome 01',
          o1Title: 'A first screen that sells',
          o1P: 'The opening view should communicate value instantly: what it is, who it’s for, and why it’s worth attention.',
          o1L1: 'Headline that makes a confident claim',
          o1L2: 'Supporting line that adds proof, not fluff',
          o1L3: 'A single primary action that stands out',

          o2Kicker: 'Outcome 02',
          o2Title: 'Cleaner path to conversion',
          o2P: 'WebSpark reduces cognitive load so the page feels easy to navigate. Less friction, more forward movement.',
          o2L1: 'CTA placement that doesn’t hide',
          o2L2: 'A deliberate section sequence',
          o2L3: 'Whitespace used as a design tool',

          o3Kicker: 'Outcome 03',
          o3Title: 'Trust through polish',
          o3P: 'Premium is consistent: type scale, spacing rhythm, and alignment make the brand feel stable and reliable.',
          o3L1: 'Typographic discipline',
          o3L2: 'Components that match, everywhere',
          o3L3: 'Accessible contrast and structure',

          o4Kicker: 'Outcome 04',
          o4Title: 'A stronger identity',
          o4P: 'A strong brand is repeated decisions. WebSpark makes those decisions coherent: buttons, cards, headings, spacing — one voice.',
          o4L1: 'Unified component styling',
          o4L2: 'Accent color used sparingly',
          o4L3: 'Symmetry and balance as default',

          o5Kicker: 'Outcome 05',
          o5Title: 'Structure that performs',
          o5P: 'Cleaner markup and headings make the page easier to understand and index. Technical clarity supports marketing clarity.',
          o5L1: 'Correct heading hierarchy',
          o5L2: 'Skimmable sections that invite scrolling',
          o5L3: 'Less clutter competing with the message',

          demoKicker: 'Preview',
          demoTitle: 'Tap to reveal the “after”',
          demoSub: 'Two sample sites, redesigned for clarity and confidence.',
          demoCoffeeTitle: 'Cafe Landing (Premium)',
          demoGameTitle: 'Game Launch (Premium)',
          demoTag: 'Same site • refined design',
          demoTag2: 'Same site • refined design',

          howKicker: 'Process',
          howTitle: 'A premium rebuild, not a rebuild-from-scratch',
          howSub: 'You keep the content. WebSpark rebuilds the presentation. You receive clean output.',
          step1Title: 'Share the site',
          step1Text: 'Link it or provide your current HTML.',
          step2Title: 'Rebuild the layout',
          step2Text: 'Hierarchy, spacing, and tone are redesigned.',
          step3Title: 'Deliver clean output',
          step3Text: 'HTML/CSS you can host anywhere.',
          howNote: 'Restraint wins. Clarity sells.',
          glanceKicker: 'Signals',
          glance1Name: 'Tone',
          glance1Pill: 'Premium',
          glance2Name: 'CTA',
          glance2Pill: 'Focused',
          glance3Name: 'Consistency',
          glance3Pill: 'High',
          glance4Name: 'Noise',
          glance4Pill: 'Minimal',

          ctaTitle: 'Ready for a premium first impression?',
          ctaSub: 'WebSpark rebuilds your presentation so the page feels deliberate — in clean HTML you control.',
          ctaBtn: 'Get started ↗'
        }
      }
    ];

    let activeThemeIndex = -1; // -1 = original
    let hasSplitControls = false;

    function clearThemeClasses(){
      THEMES.forEach(t => htmlEl.classList.remove(t.id));
    }

    function applyTextMap(map){
      if (!map) return;
      Object.keys(map).forEach((k) => {
        const el = document.querySelector('[data-ws-text="' + k + '"]');
        if (el) el.innerHTML = map[k];
      });
    }

    function restoreOriginalInstant(){
      clearThemeClasses();

      Object.keys(original.texts).forEach((k) => {
        const el = document.querySelector('[data-ws-text="' + k + '"]');
        if (el) el.innerHTML = original.texts[k];
      });

      Object.keys(original.srcs).forEach((k) => {
        const el = document.querySelector('[data-ws-src="' + k + '"]');
        if (el) el.setAttribute('src', original.srcs[k]);
      });

      if (original.heroFont) {
        htmlEl.style.setProperty('--ws-hero-font', original.heroFont.trim());
      }

      activeThemeIndex = -1;

      controls.innerHTML = `
        <button type="button" id="ws-btn-first" title="Redesign view">
          <span>🎛</span>
          <span>Redesign this view</span>
        </button>
      `;
      const newFirst = document.getElementById('ws-btn-first');
      if (newFirst) {
        newFirst.addEventListener('click', firstClickOrCycle);
      }
      hasSplitControls = false;
    }

    function restoreOriginal(){
      runScreenTransform(restoreOriginalInstant);
    }

    function applyThemeByIndexInstant(i){
      const theme = THEMES[i];
      if (!theme) return;

      clearThemeClasses();
      htmlEl.classList.add(theme.id);

      if (theme.id === 'ws-theme-editorial'){
        htmlEl.style.setProperty('--ws-hero-font', 'Georgia, "Times New Roman", Times, serif');
      } else if (theme.id === 'ws-theme-cyber'){
        htmlEl.style.setProperty('--ws-hero-font', '"Rubik Glitch", "Montserrat", system-ui, sans-serif');
      } else {
        htmlEl.style.setProperty('--ws-hero-font', '"Montserrat", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
      }

      applyTextMap(theme.content);
      activeThemeIndex = i;
    }

    function applyThemeByIndex(i){
      runScreenTransform(() => applyThemeByIndexInstant(i));
    }

    function splitControlsIfNeeded(){
      if (hasSplitControls) return;

      controls.innerHTML = `
        <button type="button" id="ws-btn-back" class="ws-danger" title="Back to original">
          <span>↩</span>
          <span>Back to original</span>
        </button>
        <button type="button" id="ws-btn-cycle" title="Redesign this view">
          <span>🎛</span>
          <span>Redesign this view</span>
        </button>
      `;

      const backBtn = document.getElementById('ws-btn-back');
      const cycleBtn = document.getElementById('ws-btn-cycle');

      if (backBtn) backBtn.addEventListener('click', restoreOriginal);
      if (cycleBtn) cycleBtn.addEventListener('click', cycleTheme);

      hasSplitControls = true;
    }

    function cycleTheme(){
      const next = (activeThemeIndex + 1) % THEMES.length;

      applyThemeByIndex(next);

      const cycleBtn = document.getElementById('ws-btn-cycle');
      if (cycleBtn){
        const theme = THEMES[next];
        const labelSpan = cycleBtn.querySelector('span:last-child');
        if (labelSpan) labelSpan.textContent = `Redesign this view — ${theme.label}`;
      }
    }

    function firstClickOrCycle(){
      if (!hasSplitControls){
        splitControlsIfNeeded();

        applyThemeByIndex(0);

        const cycleBtn = document.getElementById('ws-btn-cycle');
        if (cycleBtn){
          const theme = THEMES[0];
          const labelSpan = cycleBtn.querySelector('span:last-child');
          if (labelSpan) labelSpan.textContent = `Redesign this view — ${theme.label}`;
        }
        return;
      }

      cycleTheme();
    }

    firstBtn.addEventListener('click', firstClickOrCycle);
  })();
