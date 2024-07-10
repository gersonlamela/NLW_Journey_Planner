import { dayjs } from '@/lib/dayjs'
import { prisma } from '@/lib/prisma'
import { getMailClient } from '@/mail'
import nodemailer from 'nodemailer'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export const createInvite = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/invites',
    {
      schema: {
        tags: ['participants'],
        summary: 'Invite someone to the trip.',
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.null(),
          400: z.object({ message: z.string() }).describe('Bad request'),
        },
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { email } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new Error('Trip not found.')
      }

      const participant = await prisma.participant.create({
        data: {
          trip_id: tripId,
          email,
        },
      })

      const mail = await getMailClient()

      const formattedTripStartDate = dayjs(trip.starts_at).format('D[ de ]MMMM')
      const formattedTripEndDate = dayjs(trip.ends_at).format('D[ de ]MMMM')

      const confirmationLink = new URL(
        `planner://trip/${trip.id}?participant=${participant.id}`,
        'http://192.168.1.83:3000',
      )

      const message = await mail.sendMail({
        from: {
          name: 'Equipe plann.er',
          address: 'oi@plann.er',
        },
        to: participant.email,
        subject: `Confirm your participation in the trip to ${trip.destination} on ${formattedTripStartDate}`,
        html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>You have been invited to participate in a trip to <strong>${trip.destination}</strong> from <strong>${formattedTripStartDate} to ${formattedTripEndDate}</strong>.</p>
          <p></p>
          <p>To confirm your participation in the trip, click the link below:</p>
          <p></p>
          <p>
            <a href="${confirmationLink.toString()}">Confirm trip</a>
          </p>
          <p>If you are not sure what this email is about, please ignore it.</p>
        </div>
        `.trim(),
      })

      console.log(nodemailer.getTestMessageUrl(message))

      return reply.status(201).send()
    },
  )
}
