
import * as browserSync from 'browser-sync'

const bs = browserSync.create();

bs.init({
    server:"./src"
});

bs.watch("*.html").on("change", bs.reload);