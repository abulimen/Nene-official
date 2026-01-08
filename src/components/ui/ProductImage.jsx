const ProductImage = ({ type, className }) => {
    let imageSrc;
    if (type === 'Unsweetened Greek Yogurt') {
        imageSrc = "/images/nene-unsweetened.png";
    } else if (type === 'Sweetened Greek Yogurt') {
        imageSrc = "/images/nene-sweetened.png";
    } else if (type === 'Hero Image') {
        imageSrc = "/images/nene-hero.png";
    } else {
        imageSrc = "/images/nene-vanilla.png";
    }

    return (
        <img
            src={imageSrc}
            alt={type}
            className={`${className} object-contain`}
        />
    );
};

export default ProductImage;
