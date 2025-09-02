const HomeCategory = ({ categories }) => {
    return (
        <section className="py-16 px-4 bg-gray-50">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    Shop by Category
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {categories.map((category, index) => (
                        <div 
                            key={index}
                            className="card-biznest p-6 text-center hover:scale-105 transition-transform"
                        >
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${category.color} flex items-center justify-center text-2xl`}>
                                {category.icon}
                            </div>
                            <h3 className="font-medium text-gray-900 text-sm leading-tight">
                                {category.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HomeCategory;
