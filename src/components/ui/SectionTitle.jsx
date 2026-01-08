const SectionTitle = ({ children, subtitle }) => (
    <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3 font-serif">{children}</h2>
        {subtitle && <p className="text-stone-500 max-w-lg mx-auto">{subtitle}</p>}
    </div>
);

export default SectionTitle;
