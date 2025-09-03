import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const OfferBannerSlider = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch('/offers.json');
                const data = await response.json();
                setBanners(data);
            } catch (error) {
                console.error('Error fetching offers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    if (loading) {
        return (
            <section className="py-8 px-4 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="container mx-auto">
                    <div className="h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                        <div className="text-gray-500">Loading offers...</div>
                    </div>
                </div>
            </section>
        );
    }

    if (!banners || banners.length === 0) {
        return null;
    }

    return (
        <section className="py-8 px-4 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="container mx-auto">
                <div className="max-w-6xl mx-auto">
                    <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={30}
                        slidesPerView={1}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            bulletClass: 'swiper-pagination-bullet !bg-amber-500',
                            bulletActiveClass: 'swiper-pagination-bullet-active !bg-amber-600'
                        }}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        loop={true}
                        className="offer-banner-swiper rounded-xl overflow-hidden shadow-lg"
                    >
                        {banners.map((offer, index) => (
                            <SwiperSlide key={index}>
                                <div className="relative group cursor-pointer">
                                    <img
                                        src={offer.banner}
                                        alt={`Offer ${index + 1}`}
                                        className="w-full h-64 md:h-80 lg:h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {/* Overlay for better text visibility if needed */}
                                    <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    {/* Optional: Add text overlay if banners need titles/descriptions */}
                                    {offer.title && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                            <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                                                {offer.title}
                                            </h3>
                                            {offer.description && (
                                                <p className="text-white/90 text-sm md:text-base">
                                                    {offer.description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </SwiperSlide>
                        ))}

                        {/* Custom Navigation Buttons */}
                        <div className="swiper-button-prev !text-amber-600 !bg-white !rounded-full !w-10 !h-10 !mt-0 !top-1/2 !-translate-y-1/2 !left-4 shadow-lg hover:!bg-amber-50 transition-colors duration-200 after:!text-lg after:!font-bold"></div>
                        <div className="swiper-button-next !text-amber-600 !bg-white !rounded-full !w-10 !h-10 !mt-0 !top-1/2 !-translate-y-1/2 !right-4 shadow-lg hover:!bg-amber-50 transition-colors duration-200 after:!text-lg after:!font-bold"></div>
                    </Swiper>
                </div>
            </div>

            <style jsx>{`
                .offer-banner-swiper .swiper-pagination {
                    bottom: 20px !important;
                }
                
                .offer-banner-swiper .swiper-pagination-bullet {
                    width: 12px !important;
                    height: 12px !important;
                    margin: 0 6px !important;
                    opacity: 0.7;
                    transition: all 0.3s ease;
                }
                
                .offer-banner-swiper .swiper-pagination-bullet-active {
                    opacity: 1;
                    transform: scale(1.2);
                }

                .offer-banner-swiper .swiper-button-prev,
                .offer-banner-swiper .swiper-button-next {
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .offer-banner-swiper:hover .swiper-button-prev,
                .offer-banner-swiper:hover .swiper-button-next {
                    opacity: 1;
                }

                @media (max-width: 768px) {
                    .offer-banner-swiper .swiper-button-prev,
                    .offer-banner-swiper .swiper-button-next {
                        display: none !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default OfferBannerSlider;
