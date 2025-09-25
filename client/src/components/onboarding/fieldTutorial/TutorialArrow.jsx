/**
 * Arrow component pointing to tutorial target elements (desktop only)
 */
export default function TutorialArrow({ placement }) {
  const arrowStyles = {
    bottom: 'absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full',
    top: 'absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full rotate-180',
    right: 'absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2 -rotate-90',
    left: 'absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 rotate-90'
  };

  return (
    <div className={arrowStyles[placement] || arrowStyles.bottom}>
      <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white filter drop-shadow-sm" />
    </div>
  );
}