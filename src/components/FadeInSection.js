import React from "react";

export default function FadeInSection(props) {
  const [isVisible, setVisible] = React.useState(false);
  const domRef = React.useRef();
  React.useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(entry.isIntersecting);
        }
      });
    });
    observer.observe(domRef.current);
    return () => observer.unobserve(domRef.current);

    
  }, []);
  return (
    <div
      className={`fade-in-section ${isVisible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${props.delay}` }}
      ref={domRef}
    >
      {props.children}
    </div>
  );
}


// // src/components/FadeInSection.js
// import { useEffect, useRef } from 'react';

// export default function FadeInSection({ children, className }) {
//   const domRef = useRef(null);

//   useEffect(() => {
//       const node = domRef.current;      // capture current node
//       if (!node) return;
//       const observer = new IntersectionObserver(([entry]) => {
//         if (entry.isIntersecting) {
//           node.classList.add('is-visible');
//           observer.unobserve(node);
//       }
//   }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
//     observer.observe(node);
//     return () => observer.disconnect();
//   }, []); // Do NOT put domRef.current in deps

//   return (
//     <div ref={domRef} className={className}>
//       {children}
//     </div>
//   );
// }
