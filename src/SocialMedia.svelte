<script>
    import Subtitle from './components/Subtitle.svelte';
    import GitHub from './assets/github.svg';
    import LinkedIn from './assets/linkedin.svg';
    import Twitter from './assets/twitter.svg';
    import GMail from './assets/gmail.svg';
    import Medium from './assets/medium.svg';
</script>

<section class="social-media" id="contact">
    <Subtitle content="Contact with me" />
    <figure>
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png" alt="Beaming Face with Smiling Eyes" width="100" height="100" />
    </figure>
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
            <a href="https://www.linkedin.com/in/daniel692a/" target="_blank" rel="noopener noreferrer">
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
        background-color: #222222;
        font-family: 'Ubuntu', sans-serif;
        padding: 3rem 0;
        color: #efefef;
    }
    figure{
        display: flex;
        justify-content: center;
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
        margin: 1rem auto;
        width: 7rem;
    }
    .social-link img {
        width: 100%;
    }
    .social-link a {
        font-size: 2rem;
        text-decoration: none;
        color: #efefef;
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