import Link from 'next/link'
import { Grid, Card , Text, Spacer} from "@nextui-org/react"


import { withSessionSsr } from '../../lib/withSession';
import Layout from "../../components/layout"
import { Box } from "../../components/Box"


export const getServerSideProps = withSessionSsr(
	async function getServerSideProps({ req }) {
	  const user = req.session.user;
  
	  if(user == undefined){
		return {
		  props: {
			user: {
			  verify: false
			}
		  }
		}
	  }
	  else if(user == null){
		return {
		  props: {
			user: {
			  verify: false
			}
		  }
		}
	  }else if(new Date(user.expire) < new Date()){
		return {
		  props: {
			user: {
			  verify: false
			}
		  }
		}
	  }else if (user.verify !== true) {
		return {
		  props: {
			user: {
			  verify: false
			}
		  }
		}
	  }
  
	  return {
		props: {
		  user: req.session.user,
		},
	  };
	},
  );

export default function Home(props) {
  return (
    <Layout isActiveTest="Landing" UserData={props.user}>

	<Box css={{px: "$12", mt: "$16", "@xsMax": {px: "$10"}}}>

		<Text h1 weight="medium" >Choose App</Text>

		<Grid.Container gap={2} >

			<Link href="/kch-office">
				<Grid xs={4}>
					<Card
						isPressable
						isHoverable
						variant="bordered"
						>
						<Card.Body>
							<Text h2 weight="bold" css={{ color: "#0F7143", lineHeight: "12px", marginTop: "16px"}} >CHStar</Text>
							<Text h4 weight="semibold" css={{ color: "#8BBF38"}}>KCH OFFICE</Text>
						</Card.Body>
					</Card>
				</Grid>
			</Link>

			<Link href='/cube'>
				<Grid xs={4}>
					<Card
						isPressable
						isHoverable
						variant="bordered"
						>
						<Card.Body>
							<Text h2 weight="bold" css={{ color: "#0F7143", marginTop: "10px"}}>Cube</Text>
						</Card.Body>
					</Card>
				</Grid>
			</Link>
			
		</Grid.Container>
	</Box>

    </Layout>
  )
}