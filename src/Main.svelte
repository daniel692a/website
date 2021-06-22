<script>
    import profile from './assets/profilepic.jpg'
</script>

<main>
    <section class='presentation'>
        <figure>
            <img src="{profile}" alt="">
        </figure>
        <section class="intro">
            <h2>Daniel Armas Ramírez</h2>
            <h4>Frontend Developer and ML enthusiast.</h4>
        </section>
    </section>
</main>

<style>
    main {
        width: 100%;
    }
    .presentation {
        display: flex;
        justify-content: center;
    }
    .intro {
        background-color: rgb(30, 30, 30);
        width: 48rem;
        color: #fff;
        font-family: 'Ubuntu', sans-serif;
        height: 20rem;
        padding: 2rem;
        border-radius: 0.4rem;
    }
    h2{
        font-size: 3rem;
        overflow: hidden;
        letter-spacing: 0.3rem;
        white-space: nowrap;
        animation: typing 2s steps(20, end), blink-caret .6s step-end infinite;
    }
    h2::before{
        content: '>_';
        margin-right: 1rem;
    }
    h4{
        font-size: 2rem;
        white-space: nowrap;
        width: 0;
        overflow: hidden;
        padding-top: 1rem;
        animation: typing 3s steps(36, end) , blink-caret .4s step-end infinite;
        animation-delay: 2.5s;
    }
    @keyframes typing{
        from { width: 0}
        to {width: 100%}
    }
    @keyframes blink-caret {
        from, to { border-color: transparent }
        50% { border-color: orange; }
    }
</style>