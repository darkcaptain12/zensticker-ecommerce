export const metadata = {
  title: 'KVKK & Çerez Politikası | Zen Sticker',
  description: 'Zen Sticker Kişisel Verilerin Korunması Kanunu (KVKK) ve Çerez Politikası',
}

export default function KVKKPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold mb-8 text-foreground">KVKK & Çerez Politikası</h1>

      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni</h2>
          
          <div className="space-y-4">
            <p>
              <strong className="text-foreground">6698 sayılı Kişisel Verilerin Korunması Kanunu</strong> uyarınca, 
              Zen Sticker olarak kişisel verilerinizin korunmasına büyük önem vermekteyiz. Bu aydınlatma metni, 
              kişisel verilerinizin işlenmesine ilişkin olarak sizleri bilgilendirmek amacıyla hazırlanmıştır.
            </p>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">1. Veri Sorumlusu</h3>
              <p>
                Kişisel verileriniz, 6698 sayılı KVKK kapsamında veri sorumlusu sıfatıyla <strong className="text-foreground">Zen Sticker</strong> 
                tarafından aşağıda belirtilen amaçlar ve hukuki sebepler çerçevesinde işlenmektedir.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">2. İşlenen Kişisel Veriler</h3>
              <p>Web sitemizi ziyaret ettiğinizde veya hizmetlerimizden yararlandığınızda aşağıdaki kişisel verileriniz işlenmektedir:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                <li>Kimlik bilgileri (ad, soyad, TC kimlik numarası)</li>
                <li>İletişim bilgileri (e-posta adresi, telefon numarası, adres)</li>
                <li>Fatura bilgileri</li>
                <li>Ödeme bilgileri (kredi kartı bilgileri doğrudan saklanmamakta olup, ödeme işlemleri güvenli ödeme sağlayıcılar aracılığıyla gerçekleştirilmektedir)</li>
                <li>IP adresi, tarayıcı bilgileri, çerez bilgileri</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">3. Kişisel Verilerin İşlenme Amaçları</h3>
              <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                <li>Siparişlerinizin işlenmesi ve teslimi</li>
                <li>Müşteri hizmetleri faaliyetlerinin yürütülmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Web sitesi kullanım analizlerinin yapılması</li>
                <li>Pazarlama faaliyetlerinin gerçekleştirilmesi (açık rıza varsa)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h3>
              <p>Kişisel verileriniz aşağıdaki hukuki sebeplere dayanarak işlenmektedir:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                <li>KVKK md. 5/2-c: Sözleşmenin kurulması ve ifası</li>
                <li>KVKK md. 5/2-e: Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi</li>
                <li>KVKK md. 5/2-f: Meşru menfaatler (pazarlama, istatistiksel analiz vb.)</li>
                <li>KVKK md. 5/2-a: Açık rıza (pazarlama faaliyetleri için)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">5. Kişisel Verilerin Aktarımı</h3>
              <p>
                Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi için gerekli olan durumlarda, 
                kargo şirketleri, ödeme kuruluşları, yasal zorunluluklar çerçevesinde ilgili kamu kurum ve kuruluşları 
                ile paylaşılabilmektedir.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">6. KVKK Kapsamındaki Haklarınız</h3>
              <p>KVKK md. 11 uyarınca aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
                <li>Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini talep etme</li>
              </ul>
              <p className="mt-2">
                Haklarınızı kullanmak için{' '}
                <a href="mailto:info@e2x.com.tr" className="text-primary hover:underline">
                  info@e2x.com.tr
                </a>{' '}
                adresine e-posta gönderebilirsiniz.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Çerez (Cookie) Politikası</h2>
          
          <div className="space-y-4">
            <p>
              Zen Sticker web sitesi olarak, kullanıcı deneyimini iyileştirmek ve web sitemizin daha iyi çalışmasını 
              sağlamak amacıyla çerezler (cookies) kullanmaktayız. Bu politika, çerezlerin nasıl kullanıldığını açıklamaktadır.
            </p>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Çerez Nedir?</h3>
              <p>
                Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza (bilgisayar, tablet, 
                mobil cihaz) kaydedilen küçük metin dosyalarıdır. Çerezler, web sitelerinin işlevselliğini artırmak, 
                kullanıcı deneyimini iyileştirmek ve web sitesi kullanım istatistiklerini toplamak amacıyla kullanılır.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Kullandığımız Çerez Türleri</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-semibold mb-1 text-foreground">1. Zorunlu Çerezler</h4>
                  <p>
                    Bu çerezler web sitemizin çalışması için mutlaka gereklidir. Web sitesinin temel işlevlerini 
                    yerine getirmesini sağlar ve web sitesini kullanmanız mümkün olmaz.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-1 text-foreground">2. Performans ve Analitik Çerezler</h4>
                  <p>
                    Bu çerezler, web sitesinin nasıl kullanıldığını anlamamıza yardımcı olur. Web sitesi trafiğini 
                    analiz eder, sayfa görüntüleme sayılarını ve kullanıcı davranışlarını ölçer.
                  </p>
                  <p className="mt-2">
                    <strong className="text-foreground">Microsoft Clarity:</strong> Web sitemizde kullanıcı deneyimini 
                    analiz etmek amacıyla Microsoft Clarity analitik hizmeti kullanılmaktadır. Microsoft Clarity, 
                    web sitesi ziyaretlerini kaydeder, sayfa görüntüleme istatistiklerini toplar ve kullanıcı 
                    etkileşimlerini analiz eder. Bu hizmet, IP adresi, tarayıcı bilgileri, sayfa görüntüleme süreleri 
                    gibi teknik bilgileri işler.
                  </p>
                  <p className="mt-2">
                    Microsoft Clarity hakkında daha fazla bilgi için{' '}
                    <a 
                      href="https://privacy.microsoft.com/privacystatement" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Microsoft Gizlilik Bildirimi
                    </a>{' '}
                    sayfasını ziyaret edebilirsiniz.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-1 text-foreground">3. İşlevsellik Çerezleri</h4>
                  <p>
                    Bu çerezler, web sitesinin gelişmiş işlevlerini ve kişiselleştirmeyi sağlar. Örneğin, tercihlerinizi 
                    hatırlar ve size daha iyi bir deneyim sunar.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Çerezleri Nasıl Yönetebilirsiniz?</h3>
              <p>
                Çoğu tarayıcı, çerezleri otomatik olarak kabul eder. Ancak tarayıcı ayarlarınızdan çerezleri reddedebilir 
                veya çerez kullanımını sınırlandırabilirsiniz. Çerezleri devre dışı bırakmanız durumunda, web sitemizin 
                bazı özellikleri düzgün çalışmayabilir.
              </p>
              <p className="mt-2">
                Tarayıcınızın çerez ayarlarına aşağıdaki linklerden ulaşabilirsiniz:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                <li>
                  <a 
                    href="https://support.google.com/chrome/answer/95647" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a 
                    href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a 
                    href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a 
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">İletişim</h2>
          <p>
            KVKK ve Çerez Politikası hakkında sorularınız için bizimle iletişime geçebilirsiniz:
          </p>
          <p className="mt-2">
            <strong className="text-foreground">E-posta:</strong>{' '}
            <a href="mailto:info@e2x.com.tr" className="text-primary hover:underline">
              info@e2x.com.tr
            </a>
          </p>
          <p className="mt-2 text-sm">
            Bu politika en son <strong className="text-foreground">{new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> tarihinde güncellenmiştir.
          </p>
        </section>
      </div>
    </div>
  )
}

