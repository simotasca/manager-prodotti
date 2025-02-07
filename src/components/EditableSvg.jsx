import { useEffect, useRef } from 'react';

function EditableSvg({ src, styles, className }) {
  const svgRef = useRef();

  const onLoad = () => {
    let svgDoc = svgRef.current.contentDocument;
    styles &&
      styles.forEach(s => {
        Array.from(svgDoc.getElementsByClassName(s.class)).forEach(el => {
          Object.keys(s.styles).forEach(key => {
            el.style[key] = s.styles[key];
          });
        });
      });
  };

  useEffect(() => {
    svgRef.current && onLoad();
  }, [styles]);

  return <object ref={svgRef} className={className} type='image/svg+xml' data={src} onLoad={onLoad}></object>;
}

export default EditableSvg;
