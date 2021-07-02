<script>
    import Reveal from 'svelte-c-reveal';
    import Coding from './assets/cod.png';
</script>

<section id="about">
    <h2>About</h2>
    <Reveal duration="1" reveal="fadeInLeft">
        <section class="descrip">
            <figure>
                <img src="{Coding}" alt="Desk with a computer">
            </figure>
            <p>Hello everyone, my name is Daniel, I'm a software developer located in <i>Mexico</i>, I'm passionate about the world of technology, especially <b><i>artificial intelligence and data science.</i></b><br>
            I'm currently working as a backend developer and I'm researching on <i><b>Machine Learning</b></i>, I collaborate in both local and national software communities. My dream is to be a ML engineer.</p>
        </section>
    </Reveal>
</section>

<style>
    #about{
        width: 100%;
        font-family: 'Ubuntu', sans-serif;
        background-color: #fcc554;
        padding: 3rem 0;
    }
    h2{
        padding: 2rem 0 3rem 0;
        font-size: 4.5rem;
        text-align: center;
    }
    .descrip {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-direction: row-reverse;
        flex-wrap: wrap;
    }
    .descrip figure {
        width: 50rem;
        height: 50rem;
        border-radius: 1rem;
        overflow: hidden;
    }
    .descrip figure img{
        width: 100%;
        height: 100%;
    }
    p {
        font-size: 1.8rem;
        width: 30%;
        font-weight: 560;
        text-align: justify;
        line-height: 1.4;
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