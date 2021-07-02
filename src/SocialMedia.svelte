<script>
    import GitHub from './assets/github.svg';
    import LinkedIn from './assets/linkedin.svg';
    import Twitter from './assets/twitter.svg';
    import GMail from './assets/gmail.svg';
    import Medium from './assets/medium.svg';
</script>

<section class="social-media" id="contact">
    <h2>Social Media</h2>
    <section class="social-container">
        <section class="social-link">
            <a href="https://github.com/daniel692a" target="_blank" rel="noopener noreferrer">
                <figure>
                    <img src="{GitHub}" alt="GitHub icon">
                </figure>
                <h4>GitHub</h4>
            </a>
        </section>
        <section class="social-link">
            <a href="https://www.linkedin.com/in/daniel-armas-443994190/" target="_blank" rel="noopener noreferrer">
                <figure>
                    <img src="{LinkedIn}" alt="LinkedIn icon">
                </figure>
                <h4>LinkedIn</h4>
            </a>
        </section>
        <section class="social-link">
            <a href="https://twitter.com/daniel692a" target="_blank" rel="noopener noreferrer">
                <figure>
                    <img src="{Twitter}" alt="Twitter icon">
                </figure>
                <h4>Twitter</h4>
            </a>
        </section>
        <section class="social-link">
            <a href="mailto:daniel62armas@gmail.com" target="_blank" rel="noopener noreferrer">
                <figure>
                    <img src="{GMail}" alt="GMail icon">
                </figure>
                <h4>GMail</h4>
            </a>
        </section>
        <section class="social-link">
            <a href="https://daniel692a.medium.com/" target="_blank" rel="noopener noreferrer">
                <figure>
                    <img src="{Medium}" alt="Medium icon">
                </figure>
                <h4>Medium</h4>
            </a>
        </section>
    </section>
</section>

<style>
    .social-media {
        width: 100%;
        background-color: #fcc554;
        font-family: 'Ubuntu', sans-serif;
        padding: 3rem 0;
    }
    h2 {
        padding-top: 2rem;
        font-size: 4.5rem;
        text-align: center;
    }
    .social-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        margin-top: 6rem;
        align-items: center;
    }
    .social-link {
        width:8rem;
    }
    .social-link figure{
        width: 8rem;
    }
    .social-link img {
        width: 100%;
    }
    .social-link a {
        font-size: 2rem;
        text-decoration: none;
        color: #000;
    }
    .social-link h4 {
        text-align: center;
    }
    @media (max-width: 600px){
        .social-link {
            width: 5rem;
            margin: 2rem 5rem;
        }
        .social-link figure {
            width: 5rem;
        }
    }
</style>