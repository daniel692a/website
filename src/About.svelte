<script>
    import Reveal from 'svelte-c-reveal';
    import Coding from './assets/coding.jpg';
</script>

<section id="about">
    <h2>About</h2>
    <Reveal duration="1" reveal="fadeInDown">
        <section class="descrip">
            <figure>
                <img src="{Coding}" alt="Coding">
            </figure>
            <p>Hello everyone, my name is Daniel, I'm a developer located in Mexico, I'm passionate about the world of technology, especially Artificial Intelligence and data science.<br>
            I'm currently working as a backend developer and I'm researching on Machine Learning, I collaborate in both local and national software communities. My dream is to be a ML engineer.</p>
        </section>
    </Reveal>
</section>

<style>
    #about{
        width: 100%;
        font-family: 'Ubuntu', sans-serif;
    }
    .descrip {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row-reverse;
    }
    .descrip figure {
        border-radius: 1rem;
        width: 30rem;
        height: 30rem;
        overflow: hidden;
        margin-left: 2rem;
    }
    .descrip figure img{
        width: 100%;
        height: 100%;
        border: 4px solid #F7F5DD;
    }
    h2 {
        font-size: 4.5rem;
        text-align: center;
    }
    p {
        font-size: 1.8rem;
        width: 30%;
        font-weight: 600;
        text-align: justify;
        line-height: 1.4;
    }
</style>