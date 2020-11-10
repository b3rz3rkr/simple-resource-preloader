import regular from '../../SimpleResourcePreloader.js';
import minified from '../../dist/SimpleResourcePreloader.min.js';

const resolver = function () {
    if (document.title.includes('min')) {
        return minified;
    } else {
        return regular;
    }
};

export default resolver;