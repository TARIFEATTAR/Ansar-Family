import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'Ansar Family'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#F8F6F1', // ansar-cream
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 256,
        }}
      >
        🌳
      </div>
    ),
    {
      ...size,
    }
  )
}
