import { useLanguage } from '../contexts/LanguageContext'

export default function Education() {
  const { language } = useLanguage()

  const contentEn = {
    title: 'How to Reduce Your Carbon Footprint',
    sections: [
      {
        title: '1. Proper Waste Management',
        content: 'Separating recyclables from general waste reduces landfill usage and conserves resources. Always ensure your trash is properly sorted and collected on time.'
      },
      {
        title: '2. Reduce Single-Use Plastics',
        content: 'Choose reusable bags, bottles, and containers instead of single-use plastics. This significantly reduces waste and pollution in our environment.'
      },
      {
        title: '3. Compost Organic Waste',
        content: 'Food scraps and yard waste can be composted to create nutrient-rich soil. This reduces methane emissions from landfills and provides natural fertilizer.'
      },
      {
        title: '4. Recycle Correctly',
        content: 'Learn what materials can be recycled in your area. Clean and sort items properly to ensure they can be effectively recycled.'
      },
      {
        title: '5. Reduce Energy Consumption',
        content: 'Turn off lights and appliances when not in use. Use energy-efficient bulbs and appliances to reduce your carbon footprint.'
      },
      {
        title: '6. Support Local and Sustainable',
        content: 'Buy locally produced goods to reduce transportation emissions. Choose products with minimal packaging and sustainable practices.'
      },
    ]
  }

  const contentUr = {
    title: 'اپنے کاربن فوٹ پرنٹ کو کیسے کم کریں',
    sections: [
      {
        title: '۱. مناسب فضلہ کا انتظام',
        content: 'ری سائیکل ہونے والی اشیاء کو عام کچرے سے الگ کرنا لینڈ فل کے استعمال کو کم کرتا ہے اور وسائل کو محفوظ رکھتا ہے۔ ہمیشہ یقینی بنائیں کہ آپ کا کچرا مناسب طریقے سے ترتیب دیا گیا ہے اور وقت پر جمع کیا گیا ہے۔'
      },
      {
        title: '۲. یک بار استعمال پلاسٹک کم کریں',
        content: 'یک بار استعمال پلاسٹک کی بجائے دوبارہ استعمال ہونے والے بیگ، بوتلیں اور کنٹینر منتخب کریں۔ یہ ہمارے ماحول میں فضلہ اور آلودگی کو نمایاں طور پر کم کرتا ہے۔'
      },
      {
        title: '۳. نامیاتی فضلہ کی کھاد بنائیں',
        content: 'کھانے کے ٹکڑے اور باغ کے فضلے کو کھاد بنا کر غذائیت سے بھرپور مٹی بنائی جا سکتی ہے۔ یہ لینڈ فل سے میتھین کے اخراج کو کم کرتا ہے اور قدرتی کھاد فراہم کرتا ہے۔'
      },
      {
        title: '۴. صحیح طریقے سے ری سائیکل کریں',
        content: 'جانیں کہ آپ کے علاقے میں کون سے مواد کو ری سائیکل کیا جا سکتا ہے۔ اشیاء کو صاف اور صحیح طریقے سے ترتیب دیں تاکہ انہیں مؤثر طریقے سے ری سائیکل کیا جا سکے۔'
      },
      {
        title: '۵. توانائی کی کھپت کم کریں',
        content: 'استعمال میں نہ ہونے پر لائٹس اور آلات بند کر دیں۔ اپنے کاربن فوٹ پرنٹ کو کم کرنے کے لیے توانائی کی بچت والے بلب اور آلات استعمال کریں۔'
      },
      {
        title: '۶. مقامی اور پائیدار کی حمایت کریں',
        content: 'نقل و حمل کے اخراج کو کم کرنے کے لیے مقامی طور پر تیار کردہ سامان خریدیں۔ کم سے کم پیکیجنگ اور پائیدار طریقوں والی مصنوعات کا انتخاب کریں۔'
      },
    ]
  }

  const content = language === 'ur' ? contentUr : contentEn

  return (
    <div className="dashboard-container education-page">
      <h2>{content.title}</h2>

      <div className="education-content">
        {content.sections.map((section, index) => (
          <div key={index} className="education-section">
            <h3>{section.title}</h3>
            <p>{section.content}</p>
          </div>
        ))}
      </div>

      <div className="education-footer">
        <p>
          {language === 'en'
            ? 'Together, we can make a difference in protecting our environment and creating a sustainable future.'
            : 'مل کر، ہم اپنے ماحول کی حفاظت اور پائیدار مستقبل بنانے میں فرق پیدا کر سکتے ہیں۔'}
        </p>
      </div>
    </div>
  )
}
