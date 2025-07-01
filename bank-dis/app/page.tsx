import Image from "next/image";
import Navbar from "./home/navbar";
import MainCont from "./home/mainCont";
import YourMoney from "./home/yourMoney";
import SecureBank from "./home/secureBank";
import BankWay from "./home/bankWay";
import ImpactByNumbers from "./home/impactByNumbers";
import Performance from "./home/performance";
import  Footer from "./home/footer";
export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
     <Navbar />
     <MainCont />
     <YourMoney />
     <SecureBank />
     <BankWay />
     <ImpactByNumbers />
     <Performance />
     <Footer />
    </div>
  );
}
