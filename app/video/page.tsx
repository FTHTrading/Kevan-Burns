import Link from "next/link";
import Image from "next/image";
import { Play, ArrowRight, Copy, Film, Clock, Heart, Shield } from "lucide-react";

/**
 * /video — Video assets hub.
 * Manages video placeholders across the site.
 * Replace PLACEHOLDER URLs with real video URLs when ready.
 *
 * Video generation prompts included — use Runway Gen-4, Kling 1.6, or Luma Dream Machine.
 */

const VIDEOS = [
  {
    id: "hero-loop",
    placement: "Homepage hero + /client hero background",
    title: "Family Legacy Loop",
    duration: "12 sec · looping",
    status: "NEEDED",
    style: "Warm / Emotional",
    url: "", // ← paste your video URL here when ready
    thumbnail: "/images/legacy/hero-family-warm.png",
    prompt: `A warm, uplifting 12-second cinematic loop: Multi-generational family — grandparents, parents, two young children — sitting together in a bright sunlit living room. They're reviewing important documents on a tablet together. A gentle, glowing transparent digital vault appears above them, softly protecting the scene. The vault has golden circuit traces. Everyone smiles with genuine peace of mind. Soft golden afternoon light streams through large windows. The mood is: "everything is taken care of, our family is protected forever." Ultra-cinematic, warm color grading, shallow depth of field. Loop seamlessly. No text. 12 seconds.`,
  },
  {
    id: "onboard-explainer",
    placement: "/onboard setup wizard intro",
    title: "Setup Wizard Walkthrough",
    duration: "15 sec",
    status: "NEEDED",
    style: "Calm / Reassuring",
    url: "",
    thumbnail: "/images/legacy/hero-onboard-setup.png",
    prompt: `Calm, reassuring 15-second video showing a person confidently completing steps on a laptop at a warm home desk. The screen shows a step-by-step wizard with 7 glowing progress steps. As they complete each step, floating icons appear: a house, a wallet, legal documents, a shield, and a family silhouette. Each step glows with soft golden light when completed. The person looks relaxed and satisfied. Ends on a wide shot showing the family in the background looking relieved. Warm amber and soft blue tones. Smooth transitions. Hopeful, uplifting mood. No text overlay.`,
  },
  {
    id: "5proof-explainer",
    placement: "/vault-explained 5-proof section",
    title: "5-Proof Release Explained",
    duration: "20 sec",
    status: "NEEDED",
    style: "Professional / Educational",
    url: "",
    thumbnail: "/images/legacy/five-proof-diagram.png",
    prompt: `Clean, professional 20-second animated explainer video: A gold hexagonal vault sits in the center of a dark navy background. Five glowing nodes appear one by one around the vault, each connected by a glowing line: 1-Identity (gold, person icon), 2-Death Certificate (blue, document icon), 3-Attorney (purple, scales icon), 4-Guardian Quorum (cyan, 3 shields with 2 lit), 5-Waiting Period (emerald, clock). As each node lights up, a satisfying chime plays. When all 5 are lit, the vault door swings open revealing a warm golden glow and a family silhouette inside. Text overlay: "All 5 Required. All 5 Verified." Cinematic, no cheesy effects.`,
  },
  {
    id: "dms-explainer",
    placement: "/vault-explained dead man's switch section",
    title: "Dead Man's Switch Explained",
    duration: "15 sec",
    status: "NEEDED",
    style: "Calm / Clear",
    url: "",
    thumbnail: "/images/legacy/dead-mans-switch-flow.png",
    prompt: `A simple, clear 15-second animated timeline video on a dark background. A horizontal timeline flows left to right showing 5 steps with icons and warm color coding: Step 1 (green calendar) "Regular Check-ins" → Step 2 (yellow clock) "3 Missed" → Step 3 (orange bell) "Guardians Notified" → Step 4 (blue lock) "5-Proof Begins" → Step 5 (emerald family arc) "Family Protected". Smooth left-to-right reveal animation. At the end, bold text appears: "Your silence alone never opens the vault." Minimal, professional, hopeful tone.`,
  },
  {
    id: "testimonial-placeholder",
    placement: "/compare page and homepage testimonials section",
    title: "Client Story (to be filmed)",
    duration: "60–90 sec",
    status: "FILM READY",
    style: "Authentic / Real Story",
    url: "",
    thumbnail: "/images/legacy/hero-family-warm.png",
    prompt: `Real client testimonial format. Questions to ask: "What made you decide to set up your Legacy Vault?" / "What would have happened to your crypto assets without it?" / "How long did setup take?" / "What does it mean to know your family is protected?" Warm home setting, natural light. Authentic reactions, not scripted. B-roll: them using the vault on a laptop, family photos, reviewing documents together.`,
  },
];

export default function VideoPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-5xl mx-auto">

      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">Video Assets</p>
        <h1 className="text-3xl font-black text-white mb-3">Video Hub</h1>
        <p className="text-slate-400 max-w-2xl">
          All video placements across Legacy Vault Protocol. Each card shows where the video lives,
          the AI generation prompt, and where to drop in the URL when your video is ready.
        </p>
      </div>

      {/* Generation tools */}
      <div className="vault-card mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">Recommended AI Video Tools</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { name: "Runway Gen-4",       url: "https://runwayml.com",     badge: "Best quality",      color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
            { name: "Kling 1.6",          url: "https://klingai.com",      badge: "Best motion",       color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
            { name: "Luma Dream Machine", url: "https://lumalabs.ai",      badge: "Fastest",           color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
          ].map(({ name, url, badge, color }) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer"
              className={`vault-card border ${color} flex items-center justify-between hover:opacity-90 transition-all`}>
              <div>
                <p className="text-sm font-bold text-white">{name}</p>
                <p className={`text-xs font-semibold mt-0.5 ${color.split(" ")[0]}`}>{badge}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600" />
            </a>
          ))}
        </div>
      </div>

      {/* Video cards */}
      <div className="space-y-6">
        {VIDEOS.map((v) => (
          <div key={v.id} className="vault-card">
            <div className="flex flex-col sm:flex-row gap-5">

              {/* Thumbnail / placeholder */}
              <div className="sm:w-56 shrink-0">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-navy-800 border border-white/10">
                  <Image src={v.thumbnail} alt={v.title} fill className="object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {v.url ? (
                      <a href={v.url} target="_blank" rel="noopener noreferrer"
                        className="h-12 w-12 rounded-full bg-gold-500/90 flex items-center justify-center hover:bg-gold-400 transition-all">
                        <Play className="h-5 w-5 text-navy-950 ml-0.5" />
                      </a>
                    ) : (
                      <div className="h-12 w-12 rounded-full border-2 border-white/20 bg-navy-950/70 flex items-center justify-center">
                        <Film className="h-5 w-5 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className={`absolute top-2 right-2 rounded-full border text-[10px] font-black px-2 py-0.5 ${
                    v.url
                      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                      : v.status === "FILM READY"
                      ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                      : "text-slate-400 border-slate-500/30 bg-slate-500/10"
                  }`}>
                    {v.url ? "LIVE" : v.status}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-3 flex-wrap">
                  <h3 className="text-base font-black text-white">{v.title}</h3>
                  <span className="rounded-full border border-white/10 bg-white/5 text-[10px] text-slate-400 px-2 py-0.5 font-medium">{v.duration}</span>
                  <span className="rounded-full border border-gold-500/20 bg-gold-500/5 text-[10px] text-gold-400 px-2 py-0.5 font-medium">{v.style}</span>
                </div>

                <div className="rounded-lg border border-white/5 bg-navy-900/60 px-3 py-2 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Placement</p>
                  <p className="text-xs text-slate-400">{v.placement}</p>
                </div>

                {/* URL input */}
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Video URL (paste when ready)</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      defaultValue={v.url}
                      placeholder="https://cdn.example.com/your-video.mp4 or YouTube/Vimeo URL"
                      className="form-input text-xs flex-1"
                      readOnly={!!v.url}
                    />
                    {v.url && (
                      <a href={v.url} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs px-3 py-2 shrink-0">
                        View
                      </a>
                    )}
                  </div>
                </div>

                {/* Generation prompt */}
                <details className="group">
                  <summary className="text-xs font-semibold text-gold-400 cursor-pointer hover:text-gold-300 transition-colors flex items-center gap-1 list-none">
                    <Copy className="h-3 w-3" /> View AI generation prompt
                    <span className="group-open:rotate-90 transition-transform ml-1 text-slate-500">▶</span>
                  </summary>
                  <div className="mt-3 rounded-lg border border-gold-500/20 bg-gold-500/5 p-3">
                    <p className="text-xs text-slate-300 leading-relaxed italic whitespace-pre-wrap">{v.prompt}</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="vault-card mt-8 border border-blue-500/20 bg-blue-500/5">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-white mb-1">How to deploy a video</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              1. Generate using Runway/Kling/Luma with the prompt above.<br/>
              2. Upload to Cloudflare Stream, Bunny CDN, or Vimeo for fast global delivery.<br/>
              3. Paste the direct MP4 URL (or embed URL) into the field above.<br/>
              4. Update <code className="bg-navy-800 px-1 rounded text-gold-400">app/page.tsx</code> video section — replace <code className="bg-navy-800 px-1 rounded text-gold-400">PLACEHOLDER</code> with your URL.<br/>
              5. For background loops: use MP4 with <code className="bg-navy-800 px-1 rounded text-gold-400">autoPlay muted loop playsInline</code> on a video element.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
