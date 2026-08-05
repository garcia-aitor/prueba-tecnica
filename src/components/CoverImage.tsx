import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type CoverImageProps = {
  src: string;
  alt: string;
  $rounded?: boolean;
};

const Frame = styled.div<{ $rounded: boolean }>`
  overflow: hidden;
  background: #e6e6e6;
  border-radius: ${({ $rounded }) => ($rounded ? '50%' : '0')};
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.15);
`;

const Image = styled.img<{ $loaded: boolean }>`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

export function CoverImage({ src, alt, $rounded = false }: CoverImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);

    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <Frame $rounded={$rounded}>
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        $loaded={loaded}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </Frame>
  );
}
