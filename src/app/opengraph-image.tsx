import { ImageResponse } from 'next/og';
import { KERIS_BLADE, KERIS_GUARD, KERIS_HILT } from '@/components/brand/keris-mark';

export const alt =
  'OpenKuasa: run the whole business from one place. Six open-source business apps, named for the court of Melaka.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The image renderer has no oklch(), so the product colours are hex here.
const PRODUCTS = [
  { name: 'Tuah', colour: '#34d399' },
  { name: 'Jebat', colour: '#ff8a9a' },
  { name: 'Kasturi', colour: '#4fd1e0' },
  { name: 'Lekiu', colour: '#7fb2ff' },
  { name: 'Lekir', colour: '#ff9f5a' },
  { name: 'Bendahara', colour: '#f0c040' },
];

// The social image must render without runtime filesystem access on Cloudflare Workers.
// Use CSS gradients instead of disk-loaded background photographs and font files.

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#050807',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative backgrounds are pure CSS; no filesystem or image binding required. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            backgroundImage:
              'linear-gradient(90deg, rgba(5,8,7,0.92) 0%, rgba(5,8,7,0.7) 55%, rgba(5,8,7,0.15) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            backgroundImage:
              'radial-gradient(circle at 12% 0%, rgba(0,122,85,0.38), rgba(5,8,7,0) 55%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '64px 72px 56px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: 15,
                backgroundColor: '#007a55',
              }}
            >
              <svg width="42" height="42" viewBox="0 0 24 24" fill="#ffffff">
                <g transform="rotate(38 12 12)">
                  <path d={KERIS_BLADE} />
                  <path d={KERIS_GUARD} />
                  <path d={KERIS_HILT} />
                </g>
              </svg>
            </div>
            <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, letterSpacing: -0.5 }}>
              OpenKuasa
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                maxWidth: 900,
                fontSize: 76,
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: -2,
              }}
            >
              Run the whole business from one place.
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 26,
                fontSize: 30,
                color: 'rgba(255,255,255,0.68)',
              }}
            >
              Six open-source business apps, named for the court of Melaka.
            </div>
            <div style={{ display: 'flex', gap: 34, marginTop: 34, fontSize: 30, fontWeight: 700 }}>
              {PRODUCTS.map((product) => (
                <div key={product.name} style={{ display: 'flex', color: product.colour }}>
                  {product.name}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 20,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            Free to self-host · AGPL-3.0 · openkuasa.com
          </div>
        </div>
      </div>
    ),
    {
      ...size

    },
  );
}
