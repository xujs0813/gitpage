const gulp = require('gulp')
const rename = require('gulp-rename')

const {draft, post, name} = require('minimist')(process.argv.slice(2)) 

const config = {
    draft: {
        src: './_drafts/template.md',
        target: './_drafts'
    },
    post: {
        src: './_posts/template.md',
        target: './_posts'
    }
}

function makeDraft(cb){
    const conf = draft ? config.draft : post ? config.post : null
    if(conf){
        return gulp.src(conf.src).
            pipe(rename(`${name}.md`)).
            pipe(gulp.dest(conf.target))
    }else{
        cb()
    }
}

exports.default = gulp.series(makeDraft)