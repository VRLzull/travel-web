import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Perusahaan',
      links: [
        { name: 'Tentang Kami', href: '/tentang-kami' },
        { name: 'Tim Kami', href: '/tim-kami' },
        { name: 'Karir', href: '/karir' },
        { name: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Bantuan',
      links: [
        { name: 'Pusat Bantuan', href: '/bantuan' },
        { name: 'Syarat & Ketentuan', href: '/syarat-ketentuan' },
        { name: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
        { name: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Layanan',
      links: [
        { name: 'Paket Wisata', href: '/paket-wisata' },
        { name: 'Sewa Mobil', href: '/sewa-mobil' },
        { name: 'Pemandu Wisata', href: '/pemandu-wisata' },
        { name: 'Akomodasi', href: '/akomodasi' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <h2 className="text-2xl font-bold">TourKu</h2>
            <p className="text-gray-300 text-sm">
              Temukan pengalaman wisata terbaik dengan harga terjangkau di seluruh Indonesia.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <FiFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <FiTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <FiInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-3 md:gap-8">
              {footerLinks.map((section) => (
                <div key={section.title} className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {section.links.map((item) => (
                      <li key={item.name}>
                        <Link 
                          href={item.href}
                          className="text-base text-gray-400 hover:text-white"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <div className="flex items-center">
                <FiPhone className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-300">+62 123 4567 890</span>
              </div>
              <div className="flex items-center">
                <FiMail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-300">info@tourku.com</span>
              </div>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; {currentYear} TourKu. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
