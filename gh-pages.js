var ghpages = require('gh-pages')
ghpages.publish(
    'public',
    {
        branch : 'gh-pages',
        repo: 'https://github.com/daniel692a/website',
        user: {
            name : 'daniel692a',
            email : 'daniel62armas@gmail.com'
        }
    },
    () => {
        console.log('Delpoy complete!')
    }
)
