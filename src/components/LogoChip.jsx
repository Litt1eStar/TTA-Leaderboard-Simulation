// Full seal on a white circular chip; the image is contained, never cropped.
export default function LogoChip({ src, alt }) {
  return (
    <span className="emblem chip">
      <img src={src} alt={alt} />
    </span>
  )
}
