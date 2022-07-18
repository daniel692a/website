<script>
    import ProfilePicture from './assets/profile.jpg';
</script>

<section class='presentation'>
    <figure>
        <img src="{ProfilePicture}" alt="Daniel's picture"/>
    </figure>
    <section class="intro">
        <h2>Daniel Armas Ramírez</h2>
        <h4>Computer Science</h4>
        <h4>Data Science</h4>
    </section>
</section>

<style>
    .presentation {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        height: 90vh;
    }
    figure{
        width: 38rem;
        height: 38rem;
        margin-right: 1.5rem;
        position: relative;
    }
    figure img{
        width: 100%;
        height: 100%;
        border-radius: 1.3rem;
        border: 5px solid #F7F5DD;
    }
    figure::before {
        content: "";
        position: absolute;
        width: 30rem;
        height: 30rem;
        background-color: #D4A418;
        top: -3rem;
        left: -3rem;
        z-index: -1;
        border-radius: 1rem;
    }
    figure::after {
        content: "";
        position: absolute;
        width: 30rem;
        height: 30rem;
        background-color: #867555;
        z-index: -1;
        bottom: -3rem;
        right: -3rem;
        border-radius: 1rem;
    }
    .intro {
        background-color: rgb(20, 20, 20);
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
        animation: typing 1.5s steps(20, end), blink-caret .6s step-end infinite;
    }
    h2::before{
        content: '>_';
        margin-right: 1rem;
    }
    h4{
        font-size: 2rem;
        white-space: nowrap;
        font-family: monospace;
        overflow: hidden;
        padding-top: 1rem;
        animation: typing 2s steps(37, end) , blink-caret .4s step-end infinite;
        animation-delay: 2s;
    }
    @keyframes typing{
        from { width: 0}
        to {width: 100%}
    }
    @keyframes blink-caret {
        from, to { border-color: transparent }
        50% { border-color: rgb(196, 134, 19); }
    }
    @media (max-width: 940px) {
        .presentation {
            justify-content: space-evenly;
            flex-direction: column;
            justify-content: space-evenly;
        }
        figure {
            margin-right: 0;
            width: 25rem;
            height: 25rem;
        }
        figure::before {
            width: 25rem;
            height: 25rem;
        }
        figure::after {
            width: 25rem;
            height: 25rem;
        }
        .intro {
            width: 40rem;
        }
        h2{
            white-space: normal;
        }
        h4{
            white-space: normal;
        }
    }
    @media (max-width: 480px){
        figure {
            width: 20rem;
            height: 20rem;
        }
        figure::before {
            width: 20rem;
            height: 20rem;
        }
        figure::after {
            width: 20rem;
            height: 20rem;
        }
        .intro {
            width: 80%;
        }
        h2{
            font-size: 2.5rem;
        }
        h4{
            font-size: 1.7rem;
        }
    }
</style>