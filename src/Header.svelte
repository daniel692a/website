<script>
</script>

<header>
    <nav>
        <ul>
            <li><a href="">About</a></li>
            <li><a href="">Projects</a></li>
            <li><a href="">Contact</a></li>
        </ul>
    </nav>
</header>

<style>
    header {
        width: 100%;
        height: 8rem;
        font-family: monospace;
        font-size: 2.5rem;
    }
    ul {
        display: flex;
        list-style: none;
    }
    li {
        padding: 2rem 1rem;
        font-weight: 600;
    }
    a {
        text-decoration: none;
        color: #000;
        position: relative;
    }
    a::before {
        content: "";
        position: absolute;
        width: 0;
        height: 2px;
        bottom: 0;
        left: 0;
        visibility: hidden;
        background-color: #000;
        transition: all 0.3s ease-in-out;
    }
    a:hover::before {
        visibility: visible;
        width: 100%;
    }
</style>