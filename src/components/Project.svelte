<script>
    export let name, url, thumbnail, altThumbnail;
</script>

<section class="card">
    <a href={url} target="_blank" rel="noopener noreferrer">
        <figure>
            <img src={thumbnail} alt={altThumbnail}>
        </figure>
        <h5>{name}</h5>
    </a>
</section>

<style>
    .card {
        width: 20rem;
        background-color: #007696;
        border-radius: 1rem;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease-in;
        margin: 1rem 0;
    }
    .card figure {
        width: 100%;
    }
    .card figure img{
        width: 100%;
    }
    .card h5{
        font-size: 2rem;
        text-align: center;
        padding: 2rem 1rem;
    }
    .card a{
        text-decoration: none;
        color: #F7F5DD;
    }
    .card:hover{
        background-color: #BB006A;
    }
</style>