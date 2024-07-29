import * as browserSync from 'browser-sync'

const bs = browserSync.create();

bs.init({
    server:"./src"
});

bs.watch("src").on("change", bs.reload);