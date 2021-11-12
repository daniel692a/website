var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/daniel692a/website.git',
        user: {
            name: 'Daniel', // update to use your name
            email: 'daniel62armas@gmail.com' // Update to use your email
        },
        dotfiles: true
    },
    () => {
        console.log('Deploy Complete!')
    }
)