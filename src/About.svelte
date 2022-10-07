<script>
    import Reveal from 'svelte-c-reveal';
    import Coding from './assets/cod.png';
    import Subtitle from './components/Subtitle.svelte';
</script>

<section id="about">
    <Subtitle content='About' />
    <Reveal duration="1" reveal="fadeInLeft">
        <section class="descrip">
            <figure>
                <img src="{Coding}" alt="Desk with a computer">
            </figure>
            <p>Hello everyone, my name is Daniel, I'm a software developer located in <i>Mexico</i>, <a href='https://studentambassadors.microsoft.com/en-US/profile/160259' target="_blank" rel="noopener noreferrer">Microsoft Learn Student Ambassador</a> and Data science student at <a href="https://www.escom.ipn.mx/" target="_blank" rel="noopener noreferrer">ESCOM-IPN</a>, I'm passionate about the world of computer science, especially <i>data science and competitive programming.</i><br>
            I'm currently working as a Frontend developer and I'm researching about <i>Algorithms and Data Structures</i>, I collaborate in both local and national software communities. My dream is to be a Machine Learning engineer.<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Eyes.png" alt="Eyes" width="25" height="25" />
            </p>
        </section>
    </Reveal>
</section>

<style>
    #about{
        width: 100%;
        font-family: 'Ubuntu', sans-serif;
        background: rgb(34,34,34);
        background: linear-gradient(180deg, rgba(34,34,34,1) 0%, rgba(33,0,100,1) 100%);
        padding: 3rem 0;
        color: #efefef;
    }
    .descrip {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-direction: row-reverse;
        flex-wrap: wrap;
    }
    .descrip figure {
        width: 45rem;
        height: 45rem;
        border-radius: 1rem;
        overflow: hidden;
    }
    .descrip figure img{
        width: 100%;
        height: 100%;
    }
    p {
        font-size: 1.9rem;
        width: 40%;
        font-weight: 560;
        text-align: justify;
        line-height: 1.4;
    }
    a{
        color: #efefef;
    }
    @media (max-width: 860px) {
        .descrip {
            flex-direction: column;
        }
        .descrip figure {
            width: 30rem;
            height: 30rem;
            margin-bottom: 2rem;
        }
        p {
            width: 50%;
            margin-left: 0;
        }
    }
    @media (max-width: 580px) {
        p{
            width: 70%;
        }

    }
</style>