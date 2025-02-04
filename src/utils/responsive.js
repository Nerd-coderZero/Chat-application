// Add this to your main JavaScript file
export function handleResponsiveScaling() {
    const body = document.querySelector('body');
    const width = window.innerWidth;
    
    if (width >= 992 && width <= 1600) {
        body.style.transform = 'scale(0.9)';
        body.style.transformOrigin = 'top left';
        body.style.width = '111.11%'; // Compensate for scale
    } else if (width >= 700 && width <= 767) {
        body.style.transform = 'scale(0.8)';
        body.style.transformOrigin = 'top left';
        body.style.width = '125%'; // Compensate for scale
    } else if (width >= 600 && width <= 700) {
        body.style.transform = 'scale(0.75)';
        body.style.transformOrigin = 'top left';
        body.style.width = '133.33%'; // Compensate for scale
    } else if (width <= 600) {
        body.style.transform = 'scale(0.5)';
        body.style.transformOrigin = 'top left';
        body.style.width = '200%'; // Compensate for scale
    } else {
        body.style.transform = 'none';
        body.style.width = '100%';
    }
}

// Add event listeners
window.addEventListener('load', handleResponsiveScaling);
window.addEventListener('resize', handleResponsiveScaling);