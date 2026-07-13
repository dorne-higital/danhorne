export interface WorkItem {
	slug: string
	title: string
	subtitle: string
	tag: string
	monogram?: string
	image?: string
	description: string
	url?: string
}

export const workItems: WorkItem[] = [
	{
		slug: 'connelly-upholstery',
		title: 'Connelly Upholstery',
		subtitle: 'Upholstery site',
		url: 'www.connellyupholstery.co.uk',
		tag: 'New site',
		monogram: 'CU',
		description:
			'A brand-new site for Connelly Upholstery, built to showcase their work and make it easy for customers to get in touch and request a quote.',
	},
	{
		slug: 'for-beautys-sake',
		title: 'For Beautys Sake',
		subtitle: 'Beauty clinic',
		url: 'www.forbeautyssake.co.uk',
		tag: 'New site',
		monogram: 'FBS',
		description:
			'A fresh online home for this beauty clinic, with treatment listings and a booking-friendly layout designed to convert visitors into clients.',
	},
	{
		slug: 'wild-bikes',
		title: 'Wild Bikes',
		subtitle: 'Cycling club',
		tag: 'Site redesign',
		monogram: 'WB',
		description:
			'A redesign for a cycling club, replacing an outdated site with something faster and easier for members to navigate on the go.',
	},
	{
		slug: 'footballdle',
		title: 'Footballdle',
		subtitle: 'Football guessing game',
		url: 'www.footballdle.co.uk',
		tag: 'Side project',
		monogram: 'F',
		description:
			'A daily football guessing game built as a side project — a bit of fun to explore game logic and state outside of client work.',
	},
]
