<script>
    let Profile = './assets/profilepic.jpg';
</script>

<section class='presentation'>
    <figure>
        <img src={Profile} alt="Daniel's picture" />
    </figure>
    <section class="intro">
        <h2>Daniel Armas Ramírez</h2>
        <h4>Frontend Developer and ML enthusiast</h4>
    </section>
</section>

<style>
    .presentation {
        display: flex;
    }
    .intro {
        background-color: rgb(30, 30, 30);
        width: 45rem;
        color: #fff;
        font-family: 'Ubuntu', sans-serif;
        height: 20rem;
        padding: 2rem;
        border-radius: 0.4rem;
    }
    h2{
        font-size: 3rem;
    }
    h2::before{
        content: '>_';
    }
    h4{
        font-size: 2rem;
        padding-top: 1rem;
    }
</style>